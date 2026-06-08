import { useEffect } from "react";
import { useLotteryWallet } from "../../hooks/useLotteryWallet";

/**
 * WalletTransparency (Etapa 6.3): muestra la wallet de loteria activa del
 * sorteo en curso, con link al explorer y el pool on-chain. Da transparencia:
 * cualquiera puede verificar que el pool vive en una unica wallet por sorteo.
 *
 * Se apoya en useLotteryWallet (fetch + cache 5min + fallback). Refresca cada
 * 60s para reflejar compras nuevas en el pool.
 */

const NETWORK = import.meta.env.VITE_TON_NETWORK || "testnet";

function explorerUrl(address) {
    const base = NETWORK === "mainnet" ? "https://tonscan.org/address/" : "https://testnet.tonscan.org/address/";
    return base + address;
}

function shortAddr(a) {
    if (!a) return "";
    return `${a.slice(0, 6)}…${a.slice(-6)}`;
}

const WalletTransparency = () => {
    const { wallet, loading, refresh } = useLotteryWallet();

    useEffect(() => {
        const id = setInterval(() => { refresh(); }, 60_000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading && !wallet) {
        return (
            <div className="glass-card rounded-2xl p-4">
                <div className="h-4 w-40 rounded bg-gray-500/20 animate-pulse mb-2" />
                <div className="h-3 w-56 rounded bg-gray-500/10 animate-pulse" />
            </div>
        );
    }
    if (!wallet) return null;

    return (
        <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-300">Lottery wallet</span>
                {wallet.numeroSorteo != null && (
                    <span className="text-xs text-orange-400">Draw #{wallet.numeroSorteo}</span>
                )}
            </div>
            <a
                href={explorerUrl(wallet.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 underline break-all"
                title={wallet.address}
            >
                {shortAddr(wallet.address)}
            </a>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                <span>Pool on-chain</span>
                <span className="orbitron text-gray-200">
                    {wallet.poolBalance != null ? `${Number(wallet.poolBalance).toFixed(2)} TON` : "—"}
                </span>
            </div>
            {wallet.fallback && (
                <div className="mt-2 text-[10px] text-yellow-500/80">
                    Showing fallback address (live wallet unavailable)
                </div>
            )}
        </div>
    );
};

export default WalletTransparency;
