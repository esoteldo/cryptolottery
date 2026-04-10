import ShareModal from "../../components/ShareModal";
import { useGetPrices } from "../../context/getPricesContext";
import "./styles.css";
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from "react";
import { useGetTelegramData } from "../../context/getTelegramDataContext";
import { getReferralData } from "../../api/data";
import getRandomNumber from "../../helpers/getRandomNumber";

const Refer = () => {
    const { userData, initializedUser } = useGetTelegramData();
    const { shareModal, setShareModal } = useGetPrices();

    const [referalcode, setReferalcode] = useState('');
    const [referrals, setReferrals] = useState([]);
    const [totalReferrals, setTotalReferrals] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!initializedUser) {
            const code = getRandomNumber(10);
            setReferalcode(code);
        }
    }, [initializedUser]);

    useEffect(() => {
        const fetchReferrals = async () => {
            try {
                const id = initializedUser ? userData.id : referalcode;
                if (!id) return;
                const res = await getReferralData(id);
                const data = res.data.referrals || [];
                setReferrals(Array.isArray(data) ? data : [data]);
                setTotalReferrals(Array.isArray(data) ? data.length : 1);
            } catch (error) {
                console.error("Error fetching referral data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReferrals();
    }, [initializedUser, userData.id, referalcode]);

    // Calcular tier
    const getTier = () => {
        if (totalReferrals >= 50) return { name: 'GOLD', commission: '5%', next: null, progress: 100 };
        if (totalReferrals >= 20) return { name: 'SILVER', commission: '3%', next: 'Gold', progress: ((totalReferrals - 20) / 30 * 100) };
        return { name: 'BRONZE', commission: '1%', next: 'Silver', progress: (totalReferrals / 20 * 100) };
    };
    const tier = getTier();

    const textToCopy = `https://t.me/CriptoLotteryAppBot?startapp=${initializedUser ? userData.id : referalcode}`;

    return (
        <div className="min-h-screen relative">

            <div className="p-4 space-y-6 mt-15">
                {/* Header */}
                <header className="p-4 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <h1 className="text-xl font-bold orbitron">Referral Program</h1>
                        </div>
                        <div className="text-sm text-gray-300">
                            <span className="tier-badge" id="tier-badge">{tier.name}</span>
                        </div>
                    </div>
                </header>

                {/* Referral Link Section */}
                <div className="p-4">
                    <div className="glass-card rounded-2xl p-6 mb-6 text-center">
                        <h2 className="text-lg font-semibold mb-4 text-gray-300">Your Referral Link</h2>
                        <div className="referral-link rounded-lg p-4 mb-4 text-sm" id="referral-link">
                            {textToCopy}
                        </div>
                        <div className="flex space-x-3 mb-4">
                            <button className="copy-button flex-1 py-3 rounded-lg text-white font-bold" onClick={async () => { await navigator.clipboard.writeText(textToCopy); }}>
                                Copy Link
                            </button>
                            <button className="share-button px-6 py-3 rounded-lg" onClick={() => { setShareModal(true); }}>
                                Share
                            </button>
                        </div>
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
                    </div>
                </div>

                {/* Statistics Dashboard  */}
                <div className="p-4 pb-2">
                    <div className="glass-card rounded-2xl p-4 mb-4">
                        <h3 className="text-lg font-bold mb-4 orbitron">Your Referral Stats</h3>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="stat-card glass-card rounded-xl">
                                <div className="stat-value orbitron" id="total-referrals">{totalReferrals}</div>
                                <div className="text-sm text-gray-400">Total Referrals</div>
                            </div>
                            <div className="stat-card glass-card rounded-xl">
                                <div className="stat-value orbitron commission-earned" id="total-earnings">{tier.commission}</div>
                                <div className="text-sm text-gray-400">Commission Rate</div>
                            </div>
                        </div>

                        {/* Progress to Next Tier  */}
                        {tier.next && (
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-300">Progress to {tier.next} Tier</span>
                                    <span className="text-sm font-bold" id="tier-progress">
                                        {totalReferrals}/{tier.next === 'Silver' ? 20 : 50}
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${tier.progress}%` }} id="progress-fill"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Referral Tiers */}
                <div className="p-4 pb-2">
                    <div className="glass-card rounded-2xl p-4 mb-4">
                        <h3 className="text-lg font-bold mb-4 orbitron">Referral Tiers</h3>
                        <div className="space-y-3">
                            <div className={`flex items-center justify-between p-3 rounded-lg ${tier.name === 'BRONZE' ? 'bg-yellow-900 bg-opacity-20' : 'bg-gray-950 bg-opacity-5'}`}>
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

                            <div className={`flex items-center justify-between p-3 rounded-lg ${tier.name === 'SILVER' ? 'bg-gray-500 bg-opacity-20' : 'bg-gray-800 bg-opacity-5'}`}>
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

                            <div className={`flex items-center justify-between p-3 rounded-lg ${tier.name === 'GOLD' ? 'bg-yellow-500 bg-opacity-20' : 'bg-gray-950 bg-opacity-5'}`}>
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
                            {loading ? (
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
            <ShareModal />
        </div>
    )
}

export default Refer
