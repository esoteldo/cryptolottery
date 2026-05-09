import { useEffect, useState, useCallback } from "react";
import {
    getAdminPendingApprovals,
    approveWinnerPayout,
    rejectWinnerPayout,
    getAdminSuspendedPayouts,
    unsuspendWinnerPayout
} from "../../api/data";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { useGetTelegramData } from "../../context/getTelegramDataContext";

/**
 * AdminApprovals (Etapa 5.7).
 *
 * Banner flotante + modal con dos secciones:
 *   1. Pending approvals (winners > threshold, esperan click manual)
 *   2. Suspended payouts (caps_exceeded, esperan unsuspend)
 *
 * Auth fuerte (Etapa 5.6):
 *   - Para approve/reject/unsuspend usa adminToken (TonConnect proof, 1h).
 *   - Si el backend tiene REQUIRE_ADMIN_PROOF=true, sin token los endpoints
 *     fallan 403. El componente muestra el boton "Authenticate as admin".
 *   - Si REQUIRE_ADMIN_PROOF=false, el JWT regular funciona como fallback.
 *     El boton "Authenticate" sigue disponible pero no es obligatorio.
 *
 * Polling:
 *   - Cada 5 min cuando esta cerrado.
 *   - Cada 60s cuando el modal esta abierto.
 */

const POLL_OPEN_MS = 60_000;
const POLL_CLOSED_MS = 5 * 60_000;

const formatTon = (n) => {
    const num = parseFloat(n);
    if (Number.isNaN(num)) return "0";
    return num.toFixed(num < 0.01 ? 6 : 4).replace(/\.?0+$/, "");
};

const AdminApprovals = () => {
    const { userData } = useGetTelegramData();
    const idTelegram = userData?.id ? String(userData.id) : null;

    const adminAuth = useAdminAuth(idTelegram);

    const [pending, setPending] = useState([]);
    const [suspended, setSuspended] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [working, setWorking] = useState(null); // payoutId in flight
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const totalPendingCount = pending.length + suspended.filter(p => p.canUnsuspend).length;

    const fetchAll = useCallback(async () => {
        const token = sessionStorage.getItem("auth_token");
        if (!token) {
            setIsAdmin(false);
            setPending([]);
            setSuspended([]);
            return;
        }
        setLoading(true);
        try {
            const [pendingRes, suspendedRes] = await Promise.all([
                getAdminPendingApprovals(),
                getAdminSuspendedPayouts().catch(() => ({ data: { payouts: [] } }))
            ]);
            setPending(pendingRes.data?.payouts || []);
            setSuspended(suspendedRes.data?.payouts || []);
            setIsAdmin(true);
            setError(null);
        } catch (err) {
            const code = err.response?.status;
            if (code === 401 || code === 403) {
                setIsAdmin(false);
                setPending([]);
                setSuspended([]);
            } else {
                console.error("[AdminApprovals] fetch error:", err);
                setError(err.response?.data?.message || err.message);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
        const interval = setInterval(
            fetchAll,
            showModal ? POLL_OPEN_MS : POLL_CLOSED_MS
        );
        return () => clearInterval(interval);
    }, [fetchAll, showModal]);

    /**
     * Wrapper que asegura admin token antes de mandar la accion sensible.
     * Si no hay token, prompt al user para autenticar.
     */
    const callWithAuth = async (apiCall, payoutId) => {
        const token = adminAuth.token;
        try {
            await apiCall(payoutId, token);
            await fetchAll();
        } catch (err) {
            const code = err.response?.status;
            const msg = err.response?.data?.message || err.message;
            // Si el backend rechaza por proof faltante/expirado, sugerir auth
            if (code === 401 || (code === 403 && /proof/i.test(msg))) {
                setError(`${msg}. Click "Authenticate as admin" para refrescar.`);
            } else {
                setError(msg);
            }
            throw err;
        }
    };

    const onApprove = async (id) => {
        setWorking(id);
        setError(null);
        try {
            await callWithAuth((pid, t) => approveWinnerPayout(pid, t), id);
        } catch { /* error ya seteado */ }
        finally { setWorking(null); }
    };

    const onReject = async (id) => {
        const reason = window.prompt("Razon del reject (opcional, max 200 chars):", "");
        if (reason === null) return;
        setWorking(id);
        setError(null);
        try {
            await callWithAuth(
                (pid, t) => rejectWinnerPayout(pid, reason || "rejected by admin", t),
                id
            );
        } catch { /* error ya seteado */ }
        finally { setWorking(null); }
    };

    const onUnsuspend = async (id) => {
        if (!window.confirm(
            "Confirma que el cap permite este pago. Si no creaste un CapOverride " +
            "antes, el unsuspend va a fallar. ¿Continuar?"
        )) return;
        setWorking(id);
        setError(null);
        try {
            await callWithAuth((pid, t) => unsuspendWinnerPayout(pid, t), id);
        } catch { /* error ya seteado */ }
        finally { setWorking(null); }
    };

    if (!isAdmin) return null;
    if (totalPendingCount === 0 && !showModal) return null;

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="fixed top-24 right-4 z-50 flex items-center space-x-2 px-3 py-2 rounded-full bg-amber-500 text-black font-semibold shadow-lg hover:bg-amber-400 transition"
                aria-label="Aprobaciones pendientes"
            >
                <span>⚠</span>
                <span className="text-sm">Admin</span>
                {totalPendingCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-xs font-bold">
                        {totalPendingCount}
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
                                <h2 className="text-xl font-bold text-white">Admin panel</h2>
                                <p className="text-sm text-gray-400">
                                    Approvals + suspended payouts.
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

                        {/* Auth status bar */}
                        <div className="px-4 py-2 bg-gray-800/40 border-b border-gray-700 flex items-center justify-between text-xs">
                            {adminAuth.isAuthenticated ? (
                                <>
                                    <span className="text-green-400">
                                        ✓ Authenticated · expires in {adminAuth.minutesRemaining} min
                                    </span>
                                    <button
                                        onClick={adminAuth.logout}
                                        className="text-gray-400 hover:text-white underline"
                                    >
                                        logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="text-yellow-400">
                                        Not authenticated (using JWT fallback)
                                    </span>
                                    <button
                                        onClick={adminAuth.authenticate}
                                        disabled={adminAuth.authenticating}
                                        className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white"
                                    >
                                        {adminAuth.authenticating ? "..." : "Authenticate as admin"}
                                    </button>
                                </>
                            )}
                        </div>
                        {adminAuth.error && (
                            <div className="bg-red-900/40 border-b border-red-600 text-red-300 text-xs px-4 py-2">
                                Auth: {adminAuth.error}
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-900/40 border-b border-red-600 text-red-300 text-sm px-4 py-2">
                                {error}
                            </div>
                        )}

                        <div className="overflow-y-auto p-4 space-y-6 flex-1">
                            {/* PENDING APPROVALS */}
                            <section>
                                <h3 className="text-sm font-bold text-amber-400 mb-2 uppercase">
                                    Pending approvals ({pending.length})
                                </h3>
                                {loading && pending.length === 0 && (
                                    <p className="text-gray-500 text-sm">Loading...</p>
                                )}
                                {!loading && pending.length === 0 && (
                                    <p className="text-gray-500 text-sm">None.</p>
                                )}
                                <div className="space-y-2">
                                    {pending.map((p) => (
                                        <div
                                            key={p._id}
                                            className="bg-gray-800/60 border border-gray-700 rounded-xl p-3"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="text-white font-semibold text-sm">
                                                        Sorteo #{p.numeroSorteo ?? "?"}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        Ticket {p.valueTicket ?? "?"} · TG {p.ganadorIdTelegram ?? "?"}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-amber-400 font-bold">
                                                        {formatTon(p.netAmount)} TON
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatTon(p.amountRequested)} - {formatTon(p.networkFee)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400 break-all mb-2">
                                                {p.walletDestination}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onApprove(p._id)}
                                                    disabled={working === p._id}
                                                    className="flex-1 py-1.5 rounded bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-semibold"
                                                >
                                                    {working === p._id ? "..." : "Approve"}
                                                </button>
                                                <button
                                                    onClick={() => onReject(p._id)}
                                                    disabled={working === p._id}
                                                    className="flex-1 py-1.5 rounded bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* SUSPENDED PAYOUTS */}
                            <section>
                                <h3 className="text-sm font-bold text-orange-400 mb-2 uppercase">
                                    Suspended payouts ({suspended.length})
                                </h3>
                                {!loading && suspended.length === 0 && (
                                    <p className="text-gray-500 text-sm">None.</p>
                                )}
                                <div className="space-y-2">
                                    {suspended.map((p) => (
                                        <div
                                            key={p._id}
                                            className={`border rounded-xl p-3 ${
                                                p.canUnsuspend
                                                    ? "bg-orange-900/20 border-orange-700/50"
                                                    : "bg-red-900/20 border-red-800/50"
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <div>
                                                    <div className="text-white font-semibold text-sm">
                                                        Sorteo #{p.numeroSorteo ?? "?"}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        TG {p.ganadorIdTelegram ?? "?"}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-amber-400 font-bold">
                                                        {formatTon(p.netAmount)} TON
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400 break-all mb-1">
                                                {p.walletDestination}
                                            </div>
                                            <div className="text-xs italic mb-2 text-gray-300">
                                                Reason: {p.suspendedReason || "(none)"}
                                            </div>
                                            {p.canUnsuspend ? (
                                                <button
                                                    onClick={() => onUnsuspend(p._id)}
                                                    disabled={working === p._id}
                                                    className="w-full py-1.5 rounded bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-sm font-semibold"
                                                >
                                                    {working === p._id ? "..." : "Unsuspend (requires CapOverride)"}
                                                </button>
                                            ) : (
                                                <p className="text-xs text-red-400 italic">
                                                    Cannot unsuspend (anti-fraud trigger). Manual review required.
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminApprovals;
