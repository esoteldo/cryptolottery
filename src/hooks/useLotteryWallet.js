import { useState, useEffect } from "react";
import { getActiveLotteryWallet } from "../api/data";

/**
 * useLotteryWallet (Etapa 6.3): resuelve la wallet de loteria ACTIVA a donde
 * mandar el pago del ticket, en runtime, sin depender del bundle cacheado.
 *
 * Por que: con la rotacion de wallet entre sorteos, la direccion destino puede
 * cambiar. Si la hardcodeamos en el bundle (VITE_LOTTERY_WALLET), un usuario
 * con la app cacheada pagaria a la wallet vieja. Este hook hace fetch del
 * endpoint publico /lottery/active-wallet y cachea el resultado 5 min.
 *
 * Resiliencia: si el endpoint falla (red, backend caido), cae al env
 * VITE_LOTTERY_WALLET (o el default) para no bloquear la compra. La rotacion
 * mantiene un grace period de 24h en la wallet vieja, asi que un fallback
 * temporal a la direccion anterior sigue siendo aceptado on-chain.
 */

const FALLBACK_WALLET =
    import.meta.env.VITE_LOTTERY_WALLET ||
    "0QBigX_0lt-QVRdCzwVq0ZcmWbUTzqLpdnF2Do-VfEct4MLh";

const CACHE_TTL_MS = 5 * 60 * 1000;

// Cache module-level compartido entre montajes (equivalente liviano a SWR).
let _cache = null;
let _cacheAt = 0;
let _inFlight = null;

async function fetchActiveWallet() {
    const now = Date.now();
    if (_cache && now - _cacheAt < CACHE_TTL_MS) return _cache;
    if (_inFlight) return _inFlight;

    _inFlight = (async () => {
        try {
            const res = await getActiveLotteryWallet();
            const data = {
                address: res.data.address,
                sorteoFecha: res.data.sorteoFecha,
                numeroSorteo: res.data.numeroSorteo,
                poolBalance: res.data.poolBalance,
                fallback: false
            };
            _cache = data;
            _cacheAt = Date.now();
            return data;
        } catch (err) {
            // No cachear el fallback (TTL 0) para reintentar pronto.
            return {
                address: FALLBACK_WALLET,
                sorteoFecha: null,
                numeroSorteo: null,
                poolBalance: null,
                fallback: true
            };
        } finally {
            _inFlight = null;
        }
    })();

    return _inFlight;
}

/**
 * @returns {{ wallet, loading, error, refresh }}
 *   wallet: { address, sorteoFecha, numeroSorteo, poolBalance, fallback }
 */
export function useLotteryWallet() {
    const [wallet, setWallet] = useState(_cache);
    const [loading, setLoading] = useState(!_cache);
    const [error, setError] = useState(false);

    const load = async () => {
        setLoading(true);
        const data = await fetchActiveWallet();
        setWallet(data);
        setError(!!data.fallback);
        setLoading(false);
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            const data = await fetchActiveWallet();
            if (mounted) {
                setWallet(data);
                setError(!!data.fallback);
                setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    // refresh fuerza relectura (ignora cache).
    const refresh = async () => {
        _cache = null;
        _cacheAt = 0;
        await load();
    };

    return { wallet, loading, error, refresh };
}

/**
 * Resuelve solo la address activa, para flujos imperativos (ej. justo antes
 * de firmar la compra). Garantiza el valor mas fresco posible con cache 5min
 * y fallback al env. No es un hook (se puede llamar dentro de un handler).
 */
export async function resolveActiveWalletAddress() {
    const data = await fetchActiveWallet();
    return data.address;
}
