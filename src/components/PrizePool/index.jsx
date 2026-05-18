import { useEffect, useState } from "react";
import { useGetInitData } from "../../context/getInitDataContext";
import "./styles.css";

const PrizePool = () => {
    const { initData, initializedData } = useGetInitData();
    const [countdown, setCountdown] = useState({ hours: '00', minutes: '00', seconds: '00' });
    const [prizePool, setPrizePool] = useState(null);  // null = aun no cargado
    const [numeroSorteo, setNumeroSorteo] = useState(null);

    // Obtener prize pool del backend
    useEffect(() => {
        if (initializedData && initData?.datahome?.idUltimoSorteo) {
            const sorteo = initData.datahome.idUltimoSorteo;
            const monto = Number(sorteo.montoPremio || 0);
            setPrizePool(monto.toFixed(2));
            setNumeroSorteo(sorteo.numeroSorteo ?? null);
        }
    }, [initData, initializedData]);

    // Loading mientras initData no resolvio el sorteo (~3s al abrir la app).
    // Evita mostrar "0.00 TON" placeholder que se confunde con monto real.
    const isLoadingPool = prizePool === null;

    // 8 PM UTC countdown
    useEffect(() => {
        const tick = () => {
            const nowUtc = Date.now();
            const next = new Date();
            next.setUTCHours(20, 0, 0, 0);
            if (nowUtc > next.getTime()) next.setUTCDate(next.getUTCDate() + 1);
            const diff = next.getTime() - nowUtc;
            const h = String(Math.floor(diff / 3_600_000)).padStart(2, "0");
            const m = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, "0");
            const s = String(Math.floor((diff % 60_000) / 1000)).padStart(2, "0");
            setCountdown({ hours: h, minutes: m, seconds: s });
        };
        tick(); const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        /* Current Lottery Pool */
        <div className="glass-card rounded-2xl p-6 text-center glow-orange">
            <h2 className="text-lg font-semibold mb-2 text-gray-300">
                Current Prize Pool
                {numeroSorteo !== null ? (
                    <span className="ml-2 text-orange-400">#{numeroSorteo}</span>
                ) : isLoadingPool && (
                    <span className="ml-2 inline-block h-4 w-10 align-middle rounded bg-orange-500/20 animate-pulse" />
                )}
            </h2>
            {isLoadingPool ? (
                <div className="pool-amount mb-2 flex items-center justify-center" id="pool-amount" aria-busy="true" aria-label="Loading prize pool">
                    <div className="h-10 w-56 rounded-lg bg-gradient-to-r from-orange-500/20 via-orange-400/30 to-blue-500/20 animate-pulse" />
                </div>
            ) : (
                <div className="pool-amount orbitron mb-2" id="pool-amount">{prizePool} TON</div>
            )}
            <div className="text-sm text-gray-400">Next draw in:</div>
            <div className="flex justify-center items-center mt-4">
                <div className="countdown-timer flex space-x-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold orbitron" id="hours">{countdown.hours}</div>
                        <div className="text-xs text-gray-400">Hours</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold orbitron" id="minutes">{countdown.minutes}</div>
                        <div className="text-xs text-gray-400">Minutes</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold orbitron" id="seconds">{countdown.seconds}</div>
                        <div className="text-xs text-gray-400">Seconds</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PrizePool
