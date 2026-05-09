import { useState, useEffect, useCallback, useRef } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import { getProofPayload, submitConnectProof } from '../api/data';

/**
 * Hook de autenticacion fuerte de admin (Etapa 5.6).
 *
 * Flow:
 *   1. Admin clickea "Authenticate as admin"
 *   2. Backend emite nonce (5min ttl)
 *   3. tonConnectUI.setConnectRequestParameters() con tonProof: nonce
 *   4. Si wallet ya conectado, disconnect (forzar re-auth)
 *   5. tonConnectUI.openModal() -> wallet pide PIN/biometria, firma proof
 *   6. Wallet retorna conectado con `connectItems.tonProof.proof`
 *   7. Hook detecta el proof y lo postea a /api/admin/connect-proof
 *   8. Backend valida y emite admin JWT (1h)
 *   9. Hook guarda token en memoria. Componente lo usa via getAdminToken()
 *
 * El token vive SOLO en memoria del hook (no localStorage). Si el user
 * recarga la pagina, tiene que re-autenticarse (mas seguro).
 *
 * Auto-expiry: el componente puede leer `isAuthenticated` que computa
 * Date.now() < expiresAt. Recomendado refrescar a los 50 min.
 */
export function useAdminAuth(idTelegram) {
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();
    const [token, setToken] = useState(null);
    const [expiresAt, setExpiresAt] = useState(0);
    const [authenticating, setAuthenticating] = useState(false);
    const [error, setError] = useState(null);

    // Para evitar re-submit del mismo proof si el effect corre 2 veces
    const lastSubmittedProofRef = useRef(null);

    const isAuthenticated = !!token && Date.now() < expiresAt;
    const minutesRemaining = isAuthenticated
        ? Math.floor((expiresAt - Date.now()) / 60000)
        : 0;

    // Effect: cuando el wallet retorna con un tonProof, lo posteamos.
    useEffect(() => {
        const proofItem = wallet?.connectItems?.tonProof;
        if (!proofItem || proofItem.error) return;
        if (!wallet?.account || !idTelegram) return;

        const proof = proofItem.proof;
        if (!proof || !proof.signature) return;

        // De-dupe: el mismo proof.payload ya fue submitted
        if (lastSubmittedProofRef.current === proof.payload) return;
        lastSubmittedProofRef.current = proof.payload;

        (async () => {
            try {
                // Address llega de TonConnect en formato raw "0:abcd..."
                const friendlyAddr = Address.parse(wallet.account.address)
                    .toString({ bounceable: true });

                const res = await submitConnectProof({
                    address: friendlyAddr,
                    publicKey: wallet.account.publicKey,
                    idTelegram,
                    proof: {
                        signature: proof.signature,
                        timestamp: proof.timestamp,
                        domain: proof.domain,
                        payload: proof.payload
                    }
                });
                setToken(res.data.token);
                setExpiresAt(new Date(res.data.expiresAt).getTime());
                setError(null);
            } catch (err) {
                console.error('[useAdminAuth] connect-proof submit failed:', err);
                setError(err.response?.data?.message || err.message);
                lastSubmittedProofRef.current = null; // permitir retry
            }
        })();
    }, [wallet, idTelegram]);

    /**
     * Inicia el flow de autenticacion. Pide nonce, configura tonProof,
     * desconecta wallet (si esta) y abre modal.
     */
    const authenticate = useCallback(async () => {
        setAuthenticating(true);
        setError(null);
        try {
            // 1. Pedir nonce al backend
            const payloadRes = await getProofPayload();
            const nonce = payloadRes.data.payload;

            // 2. Configurar el tonProof requirement antes de abrir modal
            tonConnectUI.setConnectRequestParameters({
                state: 'ready',
                value: { tonProof: nonce }
            });

            // 3. Si ya hay wallet conectado, desconectar para forzar re-auth con proof
            if (wallet) {
                lastSubmittedProofRef.current = null;
                setToken(null);
                setExpiresAt(0);
                await tonConnectUI.disconnect();
            }

            // 4. Abrir modal -> wallet firmara proof y retornara conectado
            await tonConnectUI.openModal();
            // El effect de arriba detecta el wallet con proof y postea el connect-proof
        } catch (err) {
            console.error('[useAdminAuth] authenticate failed:', err);
            setError(err.message);
        } finally {
            setAuthenticating(false);
        }
    }, [tonConnectUI, wallet]);

    /**
     * Revoca el token local (logout admin). El admin JWT del backend sigue
     * siendo valido hasta su expiry; esto solo lo borra del frontend.
     */
    const logout = useCallback(() => {
        setToken(null);
        setExpiresAt(0);
        lastSubmittedProofRef.current = null;
    }, []);

    return {
        token,
        isAuthenticated,
        expiresAt,
        minutesRemaining,
        authenticate,
        authenticating,
        logout,
        error
    };
}
