import { useTonConnectUI, useTonWallet, useIsConnectionRestored } from '@tonconnect/ui-react';
import { Address } from '@ton/core';

export const useTonConnect = () => {
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();
    // `connectionRestored` queda en `false` durante los ~1-3s que tarda
    // TonConnect en restaurar la sesion desde localStorage al abrir la app.
    // Si la UI no espera este flag, durante esa ventana muestra "Disconnected"
    // aunque el wallet vaya a aparecer; el usuario clickea Connect y rompe
    // el restore en curso. Esperar este flag evita race + clicks redundantes.
    const connectionRestored = useIsConnectionRestored();

    const connected = !!wallet;

    const walletAddress = wallet?.account?.address
        ? Address.parse(wallet.account.address).toString()
        : null;

    const sendTransaction = async (toAddress, amount, payload) => {
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 5 * 60, // 5 minutes
            messages: [
                {
                    address: toAddress,
                    amount: amount, // in nanoTON
                    ...(payload ? { payload } : {})
                }
            ]
        };

        const result = await tonConnectUI.sendTransaction(transaction);
        return result;
    };

    const connectWallet = () => {
        tonConnectUI.openModal();
    };

    const disconnectWallet = () => {
        tonConnectUI.disconnect();
    };

    return {
        connected,
        connectionRestored,
        wallet,
        walletAddress,
        tonConnectUI,
        sendTransaction,
        connectWallet,
        disconnectWallet
    };
};
