import ShareModal from "../../components/ShareModal";
import { useGetPrices } from "../../context/getPricesContext";
import "./styles.css";
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from "react";
import { useGetTelegramData } from "../../context/getTelegramDataContext";
import {
    getReferralData,
    getReferralBalance,
    claimReferralCommissions
} from "../../api/data";

const TIER_INFO = {
    BRONZE: { rate: '1%', max: 20, label: 'Bronze' },
    SILVER: { rate: '3%', max: 50, label: 'Silver' },
    GOLD: { rate: '5%', max: null, label: 'Gold' }
};

const formatTon = (n) => (typeof n === 'number' ? n.toFixed(2) : '0.00');

const Refer = () => {
    const { userData, initializedUser } = useGetTelegramData();
    const { shareModal, setShareModal } = useGetPrices();

    // Lista de referidos (cards al fondo)
    const [referrals, setReferrals] = useState([]);
    const [referralsLoading, setReferralsLoading] = useState(true);

    // Balance autoritativo desde backend
    const [balance, setBalance] = useState(null);
    const [balanceLoading, setBalanceLoading] = useState(true);

    // Claim flow
    const [claimLoading, setClaimLoading] = useState(false);
    const [claimMessage, setClaimMessage] = useState(null); // {type:'ok'|'err', text:''}

    // Popup info "por que esta pending?"
    const [pendingInfoOpen, setPendingInfoOpen] = useState(false);

    // Cargar lista de referidos
    useEffect(() => {
        if (!initializedUser || !userData?.id) {
            setReferralsLoading(false);
            return;
        }
        const fetchReferrals = async () => {
            try {
                const res = await getReferralData(userData.id);
                const data = res.data.referrals || [];
                setReferrals(Array.isArray(data) ? data : [data]);
            } catch (error) {
                console.error("Error fetching referral data:", error);
            } finally {
                setReferralsLoading(false);
            }
        };
        fetchReferrals();
    }, [initializedUser, userData?.id]);

    // Cargar balance de comisiones
    const reloadBalance = async () => {
        if (!initializedUser || !userData?.id) return;
        try {
            const res = await getReferralBalance();
            setBalance(res.data);
        } catch (error) {
            console.error("Error fetching referral balance:", error);
        } finally {
            setBalanceLoading(false);
        }
    };

    useEffect(() => {
        if (!initializedUser || !userData?.id) {
            setBalanceLoading(false);
            return;
        }
        reloadBalance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initializedUser, userData?.id]);

    // Handler del boton Claim
    const handleClaim = async () => {
        setClaimLoading(true);
        setClaimMessage(null);
        try {
            const res = await claimReferralCommissions();
            setClaimMessage({
                type: 'ok',
                text: `Claim accepted. ${formatTon(res.data?.payout?.netAmount)} TON will arrive shortly.`
            });
            await reloadBalance();
        } catch (error) {
            const msg = error.response?.data?.message || 'Claim failed. Please try again.';
            setClaimMessage({ type: 'err', text: msg });
        } finally {
            setClaimLoading(false);
        }
    };

    // Datos derivados
    const tierName = balance?.tier || 'BRONZE';
    const tierInfo = TIER_INFO[tierName] || TIER_INFO.BRONZE;
    const referralsCount = balance?.referralsCount ?? 0;
    const earnings = balance?.earnings ?? 0;
    const availableBalance = balance?.availableBalance ?? 0;
    const pendingBalance = balance?.pendingBalance ?? 0;
    const minClaim = balance?.minClaim ?? 10;
    const networkFee = balance?.networkFee ?? 0.01;
    const netIfClaimed = balance?.netIfClaimedNow ?? 0;
    const canClaim = balance?.canClaim ?? false;

    // Progreso al siguiente tier
    let nextTierName = null;
    let nextTierThreshold = null;
    let progressPercent = 100;
    if (tierName === 'BRONZE') {
        nextTierName = 'Silver';
        nextTierThreshold = 20;
        progressPercent = Math.min(100, (referralsCount / 20) * 100);
    } else if (tierName === 'SILVER') {
        nextTierName = 'Gold';
        nextTierThreshold = 50;
        progressPercent = Math.min(100, ((referralsCount - 20) / 30) * 100);
    }

    // Solo generamos un link valido cuando hay un id real de Telegram.
    // Usamos ?startapp= (no ?start=) para que el link abra DIRECTAMENTE la
    // Mini App pasando el parametro a WebApp.initDataUnsafe.start_param.
    // ?start= entraria al chat del bot y pediria tocar "Iniciar" antes.
    // Requiere que el bot tenga una Main Mini App configurada en @BotFather
    // (Bot Settings -> Configure Mini App).
    const textToCopy = initializedUser && userData?.id
        ? `https://t.me/CriptoLotteryAppBot?startapp=${userData.id}`
        : '';

    // Mensaje del bloqueo del claim (si aplica)
    const blockedMessage = (() => {
        if (canClaim) return null;
        switch (balance?.blockedReason) {
            case 'wallet_required':
                return 'Set a TON wallet in your profile before claiming.';
            case 'claim_in_progress':
                return 'A previous claim is still being processed.';
            case 'below_minimum':
                return `Reach ${formatTon(minClaim)} TON available to claim.`;
            default:
                return null;
        }
    })();

    // ---- DEBUG TEMPORAL: muestra datos de Telegram WebApp ----
    // Quitar este bloque cuando termine la prueba de referidos.
    const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
    const debugInfo = {
        initialized: !!initializedUser,
        userId: userData?.id ?? '(none)',
        startParam: tg?.initDataUnsafe?.start_param ?? '(undefined)',
        platform: tg?.platform ?? '(no tg)',
        version: tg?.version ?? '(no tg)',
        hasInitData: !!tg?.initData,
    };

    return (
        <div className="min-h-screen relative">

            {/* DEBUG BANNER - QUITAR DESPUES DE LA PRUEBA */}
            <div className="fixed top-2 left-2 right-2 z-[100] bg-yellow-900/90 border border-yellow-500 rounded-lg p-3 text-xs font-mono">
                <div className="text-yellow-300 font-bold mb-1">🐛 DEBUG (referral test)</div>
                <div className="text-yellow-100 space-y-0.5">
                    <div>initialized: <span className="text-white">{String(debugInfo.initialized)}</span></div>
                    <div>userData.id: <span className="text-white">{String(debugInfo.userId)}</span></div>
                    <div>start_param: <span className={debugInfo.startParam === '(undefined)' ? 'text-red-400' : 'text-green-400'}>{String(debugInfo.startParam)}</span></div>
                    <div>platform: <span className="text-white">{String(debugInfo.platform)}</span></div>
                    <div>tier (from API): <span className="text-white">{tierName} (count: {referralsCount})</span></div>
                    <div>idReferal in user: <span className="text-white">{balance ? '(see Network tab)' : '(loading...)'}</span></div>
                </div>
            </div>

            <div className="p-4 space-y-6 mt-32">
                {/* Header */}
                <header className="p-4 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <h1 className="text-xl font-bold orbitron">Referral Program</h1>
                        </div>
                        <div className="text-sm text-gray-300">
                            <span className="tier-badge" id="tier-badge">{tierName}</span>
                        </div>
                    </div>
                </header>

                {/* Referral Link Section */}
                <div className="p-4">
                    <div className="glass-card rounded-2xl p-6 mb-6 text-center">
                        <h2 className="text-lg font-semibold mb-4 text-gray-300">Your Referral Link</h2>
                        <div className="referral-link rounded-lg p-4 mb-4 text-sm" id="referral-link">
                            {textToCopy || 'Open this app from Telegram to get your link'}
                        </div>
                        <div className="flex space-x-3 mb-4">
                            <button
                                className="copy-button flex-1 py-3 rounded-lg text-white font-bold disabled:opacity-50"
                                disabled={!textToCopy}
                                onClick={async () => { if (textToCopy) await navigator.clipboard.writeText(textToCopy); }}
                            >
                                Copy Link
                            </button>
                            <button
                                className="share-button px-6 py-3 rounded-lg disabled:opacity-50"
                                disabled={!textToCopy}
                                onClick={() => { if (textToCopy) setShareModal(true); }}
                            >
                                Share
                            </button>
                        </div>
                        {textToCopy && (
                            <>
                                <div className="qr-container mx-auto">
                                    <QRCodeSVG
                                        value={textToCopy}
                                        size={170}
                                        level="H"
                                        bgColor="#FFFFFF"
                                        fgColor="#000000"
                                    />
                                </div>
                                <div className="text-xs text-gray-400 mt-2">
                                    Scan QR code to share instantly
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Statistics Dashboard  */}
                <div className="p-4 pb-2">
                    <div className="glass-card rounded-2xl p-4 mb-4">
                        <h3 className="text-lg font-bold mb-4 orbitron">Your Referral Stats</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="stat-card glass-card rounded-xl">
                                <div className="stat-value orbitron" id="total-referrals">{referralsCount}</div>
                                <div className="text-sm text-gray-400">Total Referrals</div>
                            </div>
                            <div className="stat-card glass-card rounded-xl">
                                <div className="stat-value orbitron commission-earned">{tierInfo.rate}</div>
                                <div className="text-sm text-gray-400">Commission Rate</div>
                            </div>
                        </div>

                        {/* Total Earnings + Available */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="stat-card glass-card rounded-xl">
                                <div className="stat-value orbitron commission-earned">{formatTon(earnings)}</div>
                                <div className="text-sm text-gray-400">Total Earnings (TON)</div>
                            </div>
                            <div className="stat-card glass-card rounded-xl">
                                <div className="stat-value orbitron">{formatTon(availableBalance)}</div>
                                <div className="text-sm text-gray-400">Available (TON)</div>
                            </div>
                        </div>

                        {/* Pending con icono info */}
                        <div className="flex items-center justify-between p-3 bg-gray-900 bg-opacity-30 rounded-lg mb-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-300">Pending:</span>
                                <span className="font-bold orbitron">{formatTon(pendingBalance)} TON</span>
                                <button
                                    type="button"
                                    aria-label="Why is my balance pending?"
                                    onClick={() => setPendingInfoOpen(true)}
                                    className="w-5 h-5 rounded-full bg-gray-700 text-xs font-bold flex items-center justify-center hover:bg-gray-600"
                                >
                                    i
                                </button>
                            </div>
                            <div className="text-xs text-gray-400">Locked until next winner</div>
                        </div>

                        {/* Progress to Next Tier  */}
                        {nextTierName && (
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-300">Progress to {nextTierName} Tier</span>
                                    <span className="text-sm font-bold" id="tier-progress">
                                        {referralsCount}/{nextTierThreshold}
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${progressPercent}%` }} id="progress-fill"></div>
                                </div>
                            </div>
                        )}

                        {/* Claim section */}
                        <div className="border-t border-gray-700 pt-4 mt-4">
                            <button
                                className="w-full py-3 rounded-lg font-bold orbitron bg-gradient-to-r from-orange-500 to-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!canClaim || claimLoading || balanceLoading}
                                onClick={handleClaim}
                            >
                                {claimLoading
                                    ? 'Processing...'
                                    : canClaim
                                        ? `Claim ${formatTon(netIfClaimed)} TON`
                                        : `Claim ${formatTon(availableBalance)} TON`}
                            </button>
                            {canClaim && (
                                <div className="text-xs text-gray-400 mt-2 text-center">
                                    Network fee: {formatTon(networkFee)} TON deducted from your balance
                                </div>
                            )}
                            {blockedMessage && (
                                <div className="text-xs text-yellow-400 mt-2 text-center">
                                    {blockedMessage}
                                </div>
                            )}
                            {claimMessage && (
                                <div className={`text-xs mt-2 text-center ${claimMessage.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                                    {claimMessage.text}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Referral Tiers */}
                <div className="p-4 pb-2">
                    <div className="glass-card rounded-2xl p-4 mb-4">
                        <h3 className="text-lg font-bold mb-4 orbitron">Referral Tiers</h3>
                        <div className="space-y-3">
                            <div className={`flex items-center justify-between p-3 rounded-lg ${tierName === 'BRONZE' ? 'bg-yellow-900 bg-opacity-20' : 'bg-gray-950 bg-opacity-5'}`}>
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                                    <div>
                                        <div className="font-semibold">Bronze</div>
                                        <div className="text-xs text-gray-400">0-19 referrals</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold">1%</div>
                                    <div className="text-xs text-gray-400">commission</div>
                                </div>
                            </div>

                            <div className={`flex items-center justify-between p-3 rounded-lg ${tierName === 'SILVER' ? 'bg-gray-500 bg-opacity-20' : 'bg-gray-800 bg-opacity-5'}`}>
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                                    <div>
                                        <div className="font-semibold">Silver</div>
                                        <div className="text-xs text-gray-400">20-49 referrals</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold">3%</div>
                                    <div className="text-xs text-gray-400">commission</div>
                                </div>
                            </div>

                            <div className={`flex items-center justify-between p-3 rounded-lg ${tierName === 'GOLD' ? 'bg-yellow-500 bg-opacity-20' : 'bg-gray-950 bg-opacity-5'}`}>
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                                    <div>
                                        <div className="font-semibold">Gold</div>
                                        <div className="text-xs text-gray-400">50+ referrals</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold">5%</div>
                                    <div className="text-xs text-gray-400">commission</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Referrals  */}
                <div className="p-4 pt-0 mb-10">
                    <div className="glass-card rounded-2xl p-4 mb-4">
                        <h3 className="text-lg font-bold mb-4 orbitron">Recent Referrals</h3>
                        <div className="space-y-3" id="referrals-list">
                            {referralsLoading ? (
                                <div className="text-gray-400 text-sm py-4">Loading referrals...</div>
                            ) : referrals.length === 0 ? (
                                <div className="text-gray-400 text-sm py-4">No referrals yet. Share your link!</div>
                            ) : (
                                referrals.map((ref, index) => (
                                    <div key={ref._id || index} className="flex items-center justify-between p-3 bg-gray-900 bg-opacity-30 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
                                                {ref.region ? ref.region.slice(0, 2).toUpperCase() : '??'}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm">{ref.wallet ? ref.wallet.slice(0, 8) + '...' + ref.wallet.slice(-4) : 'No wallet'}</div>
                                                <div className="text-xs text-gray-400">{ref.region || 'Unknown'}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {ref.createdAt ? new Date(ref.createdAt).toLocaleDateString() : ''}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal info "por que pending?" */}
            {pendingInfoOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setPendingInfoOpen(false)}
                >
                    <div
                        className="glass-card rounded-2xl p-6 max-w-sm w-full text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h4 className="text-lg font-bold mb-2 orbitron">Why is my balance pending?</h4>
                        <p className="text-sm text-gray-300 mb-4">
                            Commissions are <strong>locked</strong> until a draw declares a winner.
                            When the next winner is announced, your pending TON moves to your
                            available balance and you can claim it.
                        </p>
                        <p className="text-xs text-gray-400 mb-4">
                            If a draw ends with no winner, the prize pool and your pending
                            commissions roll over to the next draw.
                        </p>
                        <button
                            className="copy-button px-6 py-2 rounded-lg text-white font-bold"
                            onClick={() => setPendingInfoOpen(false)}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}

            <ShareModal />
        </div>
    )
}

export default Refer
