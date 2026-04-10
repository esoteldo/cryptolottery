import { useEffect, useState } from 'react';
import './styles.css';
import '../Results/styles.css';
import LogoBitcoin from '../../assets/images/bitcoin-btc-logo.svg';
import LogoEthereum from '../../assets/images/ethereum-eth-logo.svg';
import { getTickets } from '../../api/data';
import { useGetTelegramData } from '../../context/getTelegramDataContext';
import { useTonConnect } from '../../hooks/useTonConnect';

const Tickets = () => {
    const { userData, initializedUser } = useGetTelegramData();
    const { walletAddress, connected } = useTonConnect();
    const [tickets, setTickets] = useState([]);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                if (walletAddress) {
                    const res = await getTickets(walletAddress);
                    setTickets(res.data.tickets || []);
                }
            } catch (error) {
                console.error("Error fetching tickets:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, [walletAddress]);

    const toggleCard = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <>
            {/* Header */}
            <header className="p-4 relative z-10 mt-18">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <h1 className="text-xl font-bold orbitron">Your Tickets</h1>
                    </div>
                    <div className="text-sm text-gray-300">
                        <span id="total-cost">Total: {tickets.length}</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="p-4 pb-32">
                <div className="glass-card rounded-2xl p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4 orbitron">Tickets History</h3>

                    {loading ? (
                        <div className="text-gray-400 text-center py-8">Loading tickets...</div>
                    ) : tickets.length === 0 ? (
                        <div className="text-gray-400 text-center py-8">No tickets yet. Buy your first ticket!</div>
                    ) : (
                        tickets.map((ticket, index) => {
                            const sorteo = ticket.idSorteo;
                            const btcDigits = ticket.valueTicket ? ticket.valueTicket.slice(0, 2) : '--';
                            const ethDigits = ticket.valueTicket ? ticket.valueTicket.slice(2, 4) : '--';
                            const expanded = expandedIndex === index;

                            return (
                                <div key={ticket._id || index} className="result-card glass-card rounded-2xl p-4 mb-3" onClick={() => toggleCard(index)}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="font-bold text-lg orbitron">Draw #{sorteo?.numeroSorteo || '-'}</div>
                                            <div className="text-sm text-gray-400">{sorteo?.fecha || ''}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-green-400">{Number(sorteo?.montoPremio || 0).toFixed(2)} TON</div>
                                            <div className="text-xs text-gray-400">{sorteo?.ganadores || 0} winners</div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-400">Your Numbers:</span>
                                            <span className="winning-number bitcoin-number"><div className='flex space-x-1'><img src={LogoBitcoin} alt="Bitcoin" className="w-5 h-5" /><div>{btcDigits}</div></div></span>
                                            <span className="winning-number ethereum-number"><div className='flex space-x-1'><img src={LogoEthereum} alt="Ethereum" className="w-5 h-5" /><div>{ethDigits}</div></div></span>
                                        </div>
                                        {ticket.ganador && (
                                            <div className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">WINNER!</div>
                                        )}
                                    </div>

                                    <div className={`winner-details ${expanded ? 'expanded' : ''}`}>
                                        <div className="border-t border-gray-700 pt-3 mt-3">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <div className="text-gray-400">Prize per Winner</div>
                                                    <div className="font-bold text-green-400">{sorteo?.montoGanadoPorUsuario || '0'} TON</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-400">Confirmed</div>
                                                    <div className="font-bold">{ticket.idTransaccion?.confirmada ? 'Yes' : 'Pending'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center mt-2">
                                        <div className="text-xs text-gray-400">Tap to {expanded ? 'collapse' : 'expand'}</div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    )
}

export default Tickets
