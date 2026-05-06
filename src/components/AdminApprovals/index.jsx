import { useEffect, useState, useCallback } from "react";
import {
    getAdminPendingApprovals,
    approveWinnerPayout,
    rejectWinnerPayout
} from "../../api/data";

/**
 * AdminApprovals: banner flotante + modal con WinnerPayouts pendientes
 * de aprobacion. Solo se renderiza si el endpoint admin/pending-approvals
 * responde 200 (es decir, el usuario es admin segun el backend con doble
 * check idTelegram + wallet). Si responde 403/401, el componente se
 * oculta silenciosamente.
 *
 * Polling:
 *   - Cada 5 min cuando esta cerrado.
 *   - Cada 60s cuando el modal esta abierto (refresh tras aprobar/rechazar).
 */

const POLL_OPEN_MS = 60_000;
const POLL_CLOSED_MS = 5 * 60_000;

const formatTon = (n) => {
    const num = parseFloat(n);
    if (Number.isNaN(num)) return "0";
    return num.toFixed(num < 0.01 ? 6 : 4).replace(/\.?0+$/, "");
};

const AdminApprovals = () => {
    const [payouts, setPayouts] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [working, setWorking] = useState(null); // payoutId en proceso
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchList = useCallback(async () => {
        const token = sessionStorage.getItem("auth_token");
        if (!token) {
            setIsAdmin(false);
            setPayouts([]);
            return;
        }
        setLoading(true);
        try {
            const res = await getAdminPendingApprovals();
            setPayouts(res.data?.payouts || []);
            setIsAdmin(true);
            setError(null);
        } catch (err) {
            const code = err.response?.status;
            if (code === 401 || code === 403) {
                // El user no es admin: ocultar todo silenciosamente.
                setIsAdmin(false);
                setPayouts([]);
            } else {
                console.error("[AdminApprovals] fetch error:", err);
                setError(err.response?.data?.message || err.message);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchList();
        const interval = setInterval(
            fetchList,
            showModal ? POLL_OPEN_MS : POLL_CLOSED_MS
        );
        return () => clearInterval(interval);
    }, [fetchList, showModal]);

    const onApprove = async (id) => {
        setWorking(id);
        setError(null);
        try {
            await approveWinnerPayout(id);
            await fetchList();
        } catch (err) {
            setError(`Approve fallo: ${err.response?.data?.message || err.message}`);
        } finally {
            setWorking(null);
        }
    };

    const onReject = async (id) => {
        const reason = window.prompt(
            "Razon del reject (opcional, max 200 chars):",
            ""
        );
        if (reason === null) return; // cancelado
        setWorking(id);
        setError(null);
        try {
            await rejectWinnerPayout(id, reason || "rejected by admin");
            await fetchList();
        } catch (err) {
            setError(`Reject fallo: ${err.response?.data?.message || err.message}`);
        } finally {
            setWorking(null);
        }
    };

    // Si el user no es admin no renderizamos nada.
    if (!isAdmin) return null;
    // Si es admin pero no hay pendientes y el modal esta cerrado, tampoco.
    if (payouts.length === 0 && !showModal) return null;

    return (
        <>
            {/* Floating button con badge */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed top-24 right-4 z-50 flex items-center space-x-2 px-3 py-2 rounded-full bg-amber-500 text-black font-semibold shadow-lg hover:bg-amber-400 transition"
                aria-label="Aprobaciones pendientes"
            >
                <span>⚠</span>
                <span className="text-sm">Aprobar</span>
                {payouts.length > 0 && (
                    <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-xs font-bold">
                        {payouts.length}
                    </span>
                )}
            </button>

            {showModal && (
                <div
                    className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="flex items-center justify-between p-4 border-b border-gray-700">
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    Aprobaciones pendientes
                                </h2>
                                <p className="text-sm text-gray-400">
                                    Pagos a ganadores que superan el limite y requieren tu OK.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-white text-2xl leading-none px-2"
                                aria-label="Cerrar"
                            >
                                ×
                            </button>
                        </header>

                        {error && (
                            <div className="bg-red-900/40 border border-red-600 text-red-300 text-sm px-4 py-2">
                                {error}
                            </div>
                        )}

                        <div className="overflow-y-auto p-4 space-y-3 flex-1">
                            {loading && payouts.length === 0 && (
                                <p className="text-gray-400 text-sm">Cargando...</p>
                            )}
                            {!loading && payouts.length === 0 && (
                                <p className="text-gray-400 text-sm">
                                    No hay aprobaciones pendientes.
                                </p>
                            )}
                            {payouts.map((p) => (
                                <div
                                    key={p._id}
                                    className="bg-gray-800/60 border border-gray-700 rounded-xl p-4"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="text-white font-semibold">
                                                Sorteo #{p.numeroSorteo ?? "?"}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Ticket {p.valueTicket ?? "?"} · Telegram {p.ganadorIdTelegram ?? "?"}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-amber-400 font-bold text-lg">
                                                {formatTon(p.netAmount)} TON
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                bruto {formatTon(p.amountRequested)} - fee {formatTon(p.networkFee)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400 break-all mb-3">
                                        {p.walletDestination}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onApprove(p._id)}
                                            disabled={working === p._id}
                                            className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold transition"
                                        >
                                            {working === p._id ? "..." : "Aprobar"}
                                        </button>
                                        <button
                                            onClick={() => onReject(p._id)}
                                            disabled={working === p._id}
                                            className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold transition"
                                        >
                                            Rechazar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminApprovals;
