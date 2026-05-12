import { useEffect, useState, useCallback } from "react";
import {
    getAdminPendingApprovals,
    approveWinnerPayout,
    rejectWinnerPayout,
    getAdminSuspendedPayouts,
    unsuspendWinnerPayout,
    getWalletBalances,
    getActiveAlerts,
    ackAlert,
    getCaps,
    listCapOverrides,
    createCapOverride,
    revokeCapOverride,
    getReconciliationLatest,
    drainWallet,
    getDrainStatus
} from "../../api/data";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { useGetTelegramData } from "../../context/getTelegramDataContext";

/**
 * AdminPanel: modal con 6 tabs para operar todo el sistema de Etapa 5.
 *
 *   Approvals    - winner payouts pendientes de aprobacion + suspended
 *   Wallets      - balances on-chain de las 5 wallets
 *   Alerts       - alertas activas (drift, cap_exceeded, etc.) + ack
 *   Caps         - cap actual + sumas del dia + crear/revocar overrides
 *   Reconciliation - ultimo snapshot + diffs + ok/drift
 *   Drains       - drain manual de servers/devs + historial reciente
 *
 * Auth fuerte (Etapa 5.6): los 4 endpoints sensibles (approve, reject,
 * unsuspend, drain) pasan adminToken corto (1h) cuando esta autenticado.
 * Si REQUIRE_ADMIN_PROOF=true en backend, sin token se rechaza.
 *
 * Polling: solo refresca la tab activa (no las inactivas) para reducir
 * carga de DB/red. Approvals + alerts polling cada 60s cuando abierto.
 */

const POLL_OPEN_MS = 60_000;
const POLL_CLOSED_MS = 5 * 60_000;

const TABS = [
    { key: 'approvals',      label: 'Approvals' },
    { key: 'wallets',        label: 'Wallets' },
    { key: 'alerts',         label: 'Alerts' },
    { key: 'caps',           label: 'Caps' },
    { key: 'reconciliation', label: 'Recon' },
    { key: 'drains',         label: 'Drains' }
];

const formatTon = (n) => {
    const num = parseFloat(n);
    if (Number.isNaN(num)) return "0";
    return num.toFixed(num < 0.01 ? 6 : 4).replace(/\.?0+$/, "");
};

const formatDate = (d) => d ? new Date(d).toLocaleString() : '—';

const AdminPanel = () => {
    const { userData } = useGetTelegramData();
    const idTelegram = userData?.id ? String(userData.id) : null;
    const adminAuth = useAdminAuth(idTelegram);

    const [isAdmin, setIsAdmin] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('approvals');
    const [error, setError] = useState(null);
    const [working, setWorking] = useState(null);

    // Approvals tab state
    const [pending, setPending] = useState([]);
    const [suspended, setSuspended] = useState([]);

    // Wallets tab state
    const [walletsData, setWalletsData] = useState(null);

    // Alerts tab state
    const [alerts, setAlerts] = useState([]);

    // Caps tab state
    const [capsData, setCapsData] = useState(null);
    const [overrides, setOverrides] = useState([]);

    // Reconciliation tab state
    const [reconciliation, setReconciliation] = useState(null);

    // Drains tab state
    const [drainForm, setDrainForm] = useState({
        sourceRole: 'servers',
        destinationAddress: '',
        amount: '',
        note: ''
    });
    const [drainResult, setDrainResult] = useState(null);

    const totalBadge = pending.length + suspended.filter(p => p.canUnsuspend).length + alerts.length;

    // -------------------- Fetchers --------------------

    const fetchApprovals = useCallback(async () => {
        try {
            const [pendingRes, suspendedRes] = await Promise.all([
                getAdminPendingApprovals(),
                getAdminSuspendedPayouts().catch(() => ({ data: { payouts: [] } }))
            ]);
            setPending(pendingRes.data?.payouts || []);
            setSuspended(suspendedRes.data?.payouts || []);
            setIsAdmin(true);
        } catch (err) {
            const code = err.response?.status;
            if (code === 401 || code === 403) {
                setIsAdmin(false);
                setPending([]); setSuspended([]);
            } else {
                setError(err.response?.data?.message || err.message);
            }
        }
    }, []);

    const fetchWallets = useCallback(async () => {
        try {
            const res = await getWalletBalances();
            setWalletsData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        }
    }, []);

    const fetchAlerts = useCallback(async () => {
        try {
            const res = await getActiveAlerts();
            setAlerts(res.data?.alerts || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        }
    }, []);

    const fetchCaps = useCallback(async () => {
        try {
            const [capsRes, oversRes] = await Promise.all([
                getCaps(),
                listCapOverrides()
            ]);
            setCapsData(capsRes.data);
            setOverrides(oversRes.data?.overrides || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        }
    }, []);

    const fetchReconciliation = useCallback(async () => {
        try {
            const res = await getReconciliationLatest();
            setReconciliation(res.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        }
    }, []);

    // Initial: try fetch approvals (probes if user is admin)
    useEffect(() => {
        const token = sessionStorage.getItem("auth_token");
        if (!token) { setIsAdmin(false); return; }
        fetchApprovals();
    }, [fetchApprovals]);

    // Refetch on tab change OR poll while modal is open
    useEffect(() => {
        if (!showModal || !isAdmin) return;
        const refresh = () => {
            if (activeTab === 'approvals') fetchApprovals();
            else if (activeTab === 'wallets') fetchWallets();
            else if (activeTab === 'alerts') fetchAlerts();
            else if (activeTab === 'caps') fetchCaps();
            else if (activeTab === 'reconciliation') fetchReconciliation();
        };
        refresh();
        const interval = setInterval(refresh, POLL_OPEN_MS);
        return () => clearInterval(interval);
    }, [showModal, isAdmin, activeTab, fetchApprovals, fetchWallets, fetchAlerts, fetchCaps, fetchReconciliation]);

    // Background poll on approvals + alerts when modal is closed (for badge)
    useEffect(() => {
        if (showModal || !isAdmin) return;
        const refresh = async () => {
            await fetchApprovals();
            await fetchAlerts();
        };
        const interval = setInterval(refresh, POLL_CLOSED_MS);
        return () => clearInterval(interval);
    }, [showModal, isAdmin, fetchApprovals, fetchAlerts]);

    // -------------------- Action wrappers --------------------

    const callWithAuth = async (apiCall, id) => {
        const token = adminAuth.token;
        try {
            await apiCall(id, token);
        } catch (err) {
            const code = err.response?.status;
            const msg = err.response?.data?.message || err.message;
            if (code === 401 || (code === 403 && /proof/i.test(msg))) {
                setError(`${msg}. Click "Authenticate as admin" to refresh.`);
            } else {
                setError(msg);
            }
            throw err;
        }
    };

    const onApprove = async (id) => {
        setWorking(id); setError(null);
        try { await callWithAuth((pid, t) => approveWinnerPayout(pid, t), id); await fetchApprovals(); }
        catch {} finally { setWorking(null); }
    };
    const onReject = async (id) => {
        const reason = window.prompt("Reject reason (optional, max 200):", "");
        if (reason === null) return;
        setWorking(id); setError(null);
        try { await callWithAuth((pid, t) => rejectWinnerPayout(pid, reason || "rejected by admin", t), id); await fetchApprovals(); }
        catch {} finally { setWorking(null); }
    };
    const onUnsuspend = async (id) => {
        if (!window.confirm("Confirm cap allows this payout. If no CapOverride is active, unsuspend will fail. Continue?")) return;
        setWorking(id); setError(null);
        try { await callWithAuth((pid, t) => unsuspendWinnerPayout(pid, t), id); await fetchApprovals(); }
        catch {} finally { setWorking(null); }
    };

    const onAckAlert = async (alertId) => {
        const reason = window.prompt("Ack reason (1-500 chars):", "");
        if (!reason) return;
        setWorking(alertId); setError(null);
        try {
            await ackAlert(alertId, reason);
            await fetchAlerts();
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally { setWorking(null); }
    };

    const onCreateOverride = async (capType) => {
        const amountStr = window.prompt(`New cap value (TON) for ${capType}. Must be > current env default.`);
        if (!amountStr) return;
        const amount = parseFloat(amountStr);
        if (!(amount > 0)) { window.alert("Invalid amount"); return; }
        const hoursStr = window.prompt("Hours until expiry (1-168, default 24)", "24");
        const expiresInHours = parseFloat(hoursStr) || 24;
        const reason = window.prompt("Reason (min 10 chars)", "");
        if (!reason || reason.length < 10) { window.alert("Reason too short"); return; }
        setWorking('create-override'); setError(null);
        try {
            await createCapOverride({ capType, amount, reason, expiresInHours });
            await fetchCaps();
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally { setWorking(null); }
    };

    const onRevokeOverride = async (overrideId) => {
        const reason = window.prompt("Revoke reason:", "");
        if (!reason) return;
        setWorking(overrideId); setError(null);
        try {
            await revokeCapOverride(overrideId, reason);
            await fetchCaps();
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally { setWorking(null); }
    };

    const onDrainSubmit = async (e) => {
        e?.preventDefault?.();
        const { sourceRole, destinationAddress, amount, note } = drainForm;
        if (!destinationAddress) { window.alert("Destination required"); return; }
        const body = { sourceRole, destinationAddress };
        if (amount) body.amount = parseFloat(amount);
        if (note) body.note = note;
        if (!window.confirm(`Confirm drain ${amount || 'ALL minus 0.05 TON buffer'} from ${sourceRole} to ${destinationAddress}?`)) return;
        setWorking('drain'); setError(null); setDrainResult(null);
        try {
            const res = await drainWallet(body, adminAuth.token);
            setDrainResult(res.data);
            // Refresh wallets to see updated balance
            await fetchWallets();
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally { setWorking(null); }
    };

    // Boton flotante siempre visible si sos admin (aunque no haya badge),
    // para que puedas operar drains / ver balances / etc. cuando quieras.
    if (!isAdmin) return null;

    // -------------------- Render helpers --------------------

    const renderApprovalsTab = () => (
        <div className="space-y-6">
            <section>
                <h3 className="text-xs font-bold text-amber-400 mb-2 uppercase">Pending approvals ({pending.length})</h3>
                {pending.length === 0 && <p className="text-gray-500 text-xs">None.</p>}
                <div className="space-y-2">
                    {pending.map(p => (
                        <div key={p._id} className="bg-gray-800/60 border border-gray-700 rounded-xl p-3">
                            <div className="flex justify-between items-start mb-1 text-xs">
                                <div>
                                    <div className="text-white font-semibold">Sorteo #{p.numeroSorteo ?? "?"}</div>
                                    <div className="text-gray-400">Ticket {p.valueTicket} · TG {p.ganadorIdTelegram}</div>
                                </div>
                                <div className="text-amber-400 font-bold">{formatTon(p.netAmount)} TON</div>
                            </div>
                            <div className="text-[10px] text-gray-500 break-all mb-2">{p.walletDestination}</div>
                            <div className="flex gap-2">
                                <button onClick={() => onApprove(p._id)} disabled={working === p._id} className="flex-1 py-1.5 rounded bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-semibold">{working === p._id ? "..." : "Approve"}</button>
                                <button onClick={() => onReject(p._id)} disabled={working === p._id} className="flex-1 py-1.5 rounded bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold">Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            <section>
                <h3 className="text-xs font-bold text-orange-400 mb-2 uppercase">Suspended ({suspended.length})</h3>
                {suspended.length === 0 && <p className="text-gray-500 text-xs">None.</p>}
                <div className="space-y-2">
                    {suspended.map(p => (
                        <div key={p._id} className={`border rounded-xl p-3 ${p.canUnsuspend ? "bg-orange-900/20 border-orange-700/50" : "bg-red-900/20 border-red-800/50"}`}>
                            <div className="flex justify-between items-start mb-1 text-xs">
                                <div>
                                    <div className="text-white font-semibold">Sorteo #{p.numeroSorteo ?? "?"}</div>
                                    <div className="text-gray-400">TG {p.ganadorIdTelegram}</div>
                                </div>
                                <div className="text-amber-400 font-bold">{formatTon(p.netAmount)} TON</div>
                            </div>
                            <div className="text-[10px] text-gray-400 italic mb-2">Reason: {p.suspendedReason}</div>
                            {p.canUnsuspend ? (
                                <button onClick={() => onUnsuspend(p._id)} disabled={working === p._id} className="w-full py-1.5 rounded bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-semibold">{working === p._id ? "..." : "Unsuspend"}</button>
                            ) : (
                                <p className="text-[10px] text-red-400 italic">Cannot unsuspend (anti-fraud). Manual review.</p>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );

    const renderWalletsTab = () => (
        <div className="space-y-2">
            <h3 className="text-xs font-bold text-blue-400 uppercase">Wallet balances on-chain</h3>
            {!walletsData && <p className="text-gray-500 text-xs">Loading...</p>}
            {walletsData?.balances?.map(b => (
                <div key={b.role} className="bg-gray-800/60 border border-gray-700 rounded-lg p-2 text-xs">
                    <div className="flex justify-between mb-1">
                        <span className="text-white font-semibold uppercase">{b.role}</span>
                        <span className={`font-mono ${b.error ? 'text-red-400' : 'text-green-400'}`}>
                            {b.error ? 'ERR' : `${formatTon(b.balance)} TON`}
                        </span>
                    </div>
                    {b.address && <div className="text-[10px] text-gray-500 break-all">{b.address}</div>}
                    {b.error && <div className="text-[10px] text-red-400">{b.error}</div>}
                </div>
            ))}
            <button onClick={fetchWallets} className="w-full py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">Refresh</button>
        </div>
    );

    const renderAlertsTab = () => (
        <div className="space-y-2">
            <h3 className="text-xs font-bold text-red-400 uppercase">Active alerts ({alerts.length})</h3>
            {alerts.length === 0 && <p className="text-gray-500 text-xs">No active alerts.</p>}
            {alerts.map(a => (
                <div key={a._id} className={`border rounded-xl p-3 text-xs ${
                    a.severity === 'critical' ? 'bg-red-900/30 border-red-700' :
                    a.severity === 'warning' ? 'bg-yellow-900/20 border-yellow-700/50' :
                    'bg-gray-800/60 border-gray-700'
                }`}>
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-white font-semibold">{a.title}</span>
                        <span className="text-[10px] text-gray-500">{a.severity}</span>
                    </div>
                    <div className="text-gray-400 mb-2">{a.message}</div>
                    <div className="text-[10px] text-gray-500 mb-2">{formatDate(a.createdAt)} · type={a.type}</div>
                    <button onClick={() => onAckAlert(a._id)} disabled={working === a._id} className="w-full py-1 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs">{working === a._id ? "..." : "Acknowledge"}</button>
                </div>
            ))}
        </div>
    );

    const renderCapsTab = () => {
        if (!capsData) return <p className="text-gray-500 text-xs">Loading...</p>;
        const capTypes = ['daily_winner', 'daily_referral', 'daily_drain', 'per_tx'];
        return (
            <div className="space-y-3 text-xs">
                <div className="text-[10px] text-gray-500">
                    Caps enabled: <span className={capsData.enabled ? 'text-green-400' : 'text-red-400'}>{String(capsData.enabled)}</span>
                </div>
                {capTypes.map(t => {
                    const c = capsData.caps[t];
                    return (
                        <div key={t} className="bg-gray-800/60 border border-gray-700 rounded-lg p-2">
                            <div className="flex justify-between mb-1">
                                <span className="text-white font-semibold">{t}</span>
                                <span className="text-gray-400">
                                    {t !== 'per_tx' && `${formatTon(c.currentSum)} / `}{formatTon(c.effective)} TON
                                </span>
                            </div>
                            <div className="text-[10px] text-gray-500">
                                env={c.envDefault} {c.override && `· override active +${formatTon(c.override.amount - c.envDefault)} TON until ${formatDate(c.override.expiresAt)}`}
                            </div>
                            <button onClick={() => onCreateOverride(t)} disabled={working === 'create-override'} className="mt-1 px-2 py-0.5 rounded bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white text-[10px]">+ Override</button>
                        </div>
                    );
                })}
                {overrides.filter(o => !o.revokedAt && new Date(o.expiresAt) > new Date()).length > 0 && (
                    <section>
                        <h4 className="text-[11px] font-bold text-amber-400 mt-2 mb-1 uppercase">Active overrides</h4>
                        {overrides.filter(o => !o.revokedAt && new Date(o.expiresAt) > new Date()).map(o => (
                            <div key={o._id} className="bg-amber-900/20 border border-amber-700/40 rounded p-2 mb-1">
                                <div className="flex justify-between">
                                    <span>{o.capType}: {formatTon(o.amount)} TON</span>
                                    <button onClick={() => onRevokeOverride(o._id)} disabled={working === o._id} className="text-red-400 hover:text-red-300 text-[10px]">Revoke</button>
                                </div>
                                <div className="text-[10px] text-gray-400">expires {formatDate(o.expiresAt)} · {o.reason}</div>
                            </div>
                        ))}
                    </section>
                )}
            </div>
        );
    };

    const renderReconciliationTab = () => {
        if (!reconciliation) return <p className="text-gray-500 text-xs">Loading...</p>;
        const snap = reconciliation.latest;
        if (!snap) return <p className="text-gray-500 text-xs">No snapshot yet.</p>;
        return (
            <div className="space-y-2 text-xs">
                <div className="flex justify-between items-baseline">
                    <span className="text-white font-semibold">Latest snapshot</span>
                    <span className={`font-bold uppercase ${
                        snap.status === 'ok' ? 'text-green-400' :
                        snap.status === 'drift' ? 'text-red-400' :
                        'text-blue-400'
                    }`}>{snap.status}</span>
                </div>
                <div className="text-[10px] text-gray-500">{formatDate(snap.createdAt)}</div>
                {reconciliation.activeAlertsCount > 0 && (
                    <div className="bg-red-900/30 border border-red-700/50 rounded p-2 text-[11px] text-red-300">
                        {reconciliation.activeAlertsCount} active alert(s) — see Alerts tab.
                    </div>
                )}
                <table className="w-full text-[10px]">
                    <thead>
                        <tr className="text-gray-500 border-b border-gray-700">
                            <th className="text-left">Role</th>
                            <th className="text-right">Obs</th>
                            <th className="text-right">Exp</th>
                            <th className="text-right">Diff</th>
                            <th className="text-right">Tol</th>
                        </tr>
                    </thead>
                    <tbody>
                        {snap.balances?.map(b => (
                            <tr key={b.role} className="border-b border-gray-800">
                                <td className="text-white">{b.role}</td>
                                <td className="text-right text-green-300">{formatTon(b.observed)}</td>
                                <td className="text-right text-gray-400">{formatTon(b.expected)}</td>
                                <td className={`text-right ${Math.abs(b.diff) > b.tolerance ? 'text-red-400' : 'text-gray-400'}`}>{formatTon(b.diff)}</td>
                                <td className="text-right text-gray-500">{formatTon(b.tolerance)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderDrainsTab = () => (
        <form onSubmit={onDrainSubmit} className="space-y-2 text-xs">
            <h3 className="text-xs font-bold text-purple-400 uppercase">New drain</h3>
            <div>
                <label className="block text-gray-400 mb-1">Source wallet</label>
                <select value={drainForm.sourceRole} onChange={e => setDrainForm({...drainForm, sourceRole: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded p-1.5 text-white">
                    <option value="servers">servers</option>
                    <option value="devs">devs</option>
                </select>
            </div>
            <div>
                <label className="block text-gray-400 mb-1">Destination address</label>
                <input type="text" value={drainForm.destinationAddress} onChange={e => setDrainForm({...drainForm, destinationAddress: e.target.value})} placeholder="EQ... or 0Q..." className="w-full bg-gray-800 border border-gray-700 rounded p-1.5 text-white font-mono" />
            </div>
            <div>
                <label className="block text-gray-400 mb-1">Amount (TON, empty = drain all minus 0.05)</label>
                <input type="number" step="0.0001" value={drainForm.amount} onChange={e => setDrainForm({...drainForm, amount: e.target.value})} placeholder="0.05" className="w-full bg-gray-800 border border-gray-700 rounded p-1.5 text-white" />
            </div>
            <div>
                <label className="block text-gray-400 mb-1">Note (audit)</label>
                <input type="text" value={drainForm.note} onChange={e => setDrainForm({...drainForm, note: e.target.value})} placeholder="payment to X" className="w-full bg-gray-800 border border-gray-700 rounded p-1.5 text-white" />
            </div>
            <button type="submit" disabled={working === 'drain'} className="w-full py-2 rounded bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white text-xs font-semibold">{working === 'drain' ? 'Sending...' : 'Send drain'}</button>
            {drainResult && (
                <div className="bg-purple-900/30 border border-purple-700 rounded p-2 mt-2 text-[10px] text-purple-200">
                    <div>drainId: {drainResult.drainId}</div>
                    <div>queryId: {drainResult.queryId}</div>
                    <div>amount: {drainResult.amount} TON</div>
                    <div>status: {drainResult.status}</div>
                </div>
            )}
        </form>
    );

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="fixed top-24 right-4 z-50 flex items-center space-x-2 px-3 py-2 rounded-full bg-amber-500 text-black font-semibold shadow-lg hover:bg-amber-400 transition"
            >
                <span>⚠</span>
                <span className="text-sm">Admin</span>
                {totalBadge > 0 && <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-xs font-bold">{totalBadge}</span>}
            </button>

            {showModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2" onClick={() => setShowModal(false)}>
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <header className="flex items-center justify-between p-3 border-b border-gray-700">
                            <h2 className="text-lg font-bold text-white">Admin panel</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-2xl leading-none px-2">×</button>
                        </header>

                        {/* Auth status */}
                        <div className="px-3 py-1.5 bg-gray-800/40 border-b border-gray-700 flex items-center justify-between text-[11px]">
                            {adminAuth.isAuthenticated ? (
                                <>
                                    <span className="text-green-400">✓ Authenticated · {adminAuth.minutesRemaining}m left</span>
                                    <button onClick={adminAuth.logout} className="text-gray-400 hover:text-white underline">logout</button>
                                </>
                            ) : (
                                <>
                                    <span className="text-yellow-400">Using JWT fallback</span>
                                    <button onClick={adminAuth.authenticate} disabled={adminAuth.authenticating} className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white">
                                        {adminAuth.authenticating ? "..." : "Authenticate"}
                                    </button>
                                </>
                            )}
                        </div>
                        {adminAuth.error && <div className="bg-red-900/40 border-b border-red-600 text-red-300 text-[11px] px-3 py-1">Auth: {adminAuth.error}</div>}
                        {error && <div className="bg-red-900/40 border-b border-red-600 text-red-300 text-xs px-3 py-1.5 flex justify-between"><span>{error}</span><button onClick={() => setError(null)} className="text-red-400">×</button></div>}

                        {/* Tab bar */}
                        <nav className="flex border-b border-gray-700 overflow-x-auto">
                            {TABS.map(t => (
                                <button
                                    key={t.key}
                                    onClick={() => setActiveTab(t.key)}
                                    className={`flex-shrink-0 px-3 py-2 text-xs font-semibold whitespace-nowrap ${
                                        activeTab === t.key
                                            ? 'text-white border-b-2 border-amber-500'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </nav>

                        {/* Tab content */}
                        <div className="overflow-y-auto p-3 flex-1">
                            {activeTab === 'approvals'      && renderApprovalsTab()}
                            {activeTab === 'wallets'        && renderWalletsTab()}
                            {activeTab === 'alerts'         && renderAlertsTab()}
                            {activeTab === 'caps'           && renderCapsTab()}
                            {activeTab === 'reconciliation' && renderReconciliationTab()}
                            {activeTab === 'drains'         && renderDrainsTab()}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminPanel;
