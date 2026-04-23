import './styles.css';
import LogoBitcoin from '../../assets/images/bitcoin-btc-logo.svg';
import LogoEthereum from '../../assets/images/ethereum-eth-logo.svg';
import { useEffect, useState } from 'react';
import { getProcessedSorteos, searchWinners } from '../../api/data';

const Results = () => {
    const [allResults, setAllResults] = useState([]);
    const [results, setResults] = useState([]);
    const [mode, setMode] = useState('sorteos'); // 'sorteos' | 'winners'
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const parseFecha = (fecha) => {
        if (!fecha) return null;
        // formato: "2026-04-09-20:00:00" → "2026-04-09T20:00:00Z"
        const parts = fecha.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
        if (!parts) return null;
        return new Date(`${parts[1]}T${parts[2]}Z`);
    };

    const applyFilter = (data, filter) => {
        if (filter === 'all') return data;
        if (filter === 'jackpot') return data.filter(s => s.ganadores > 0);

        const now = new Date();
        const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        let cutoff;

        if (filter === 'today') {
            cutoff = startOfDay;
        } else if (filter === 'week') {
            cutoff = new Date(startOfDay);
            cutoff.setUTCDate(cutoff.getUTCDate() - 7);
        } else if (filter === 'month') {
            cutoff = new Date(startOfDay);
            cutoff.setUTCMonth(cutoff.getUTCMonth() - 1);
        }

        return data.filter(s => {
            const d = parseFecha(s.fecha);
            return d && d >= cutoff;
        });
    };

    const fetchResults = async () => {
        try {
            setLoading(true);
            const res = await getProcessedSorteos();
            const sorteos = res.data.sorteos || [];
            setAllResults(sorteos);
            setResults(applyFilter(sorteos, activeFilter));
            setMode('sorteos');
            setCurrentPage(1);
        } catch (error) {
            console.error("Error fetching results:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchResults();
            return;
        }
        try {
            setLoading(true);
            const res = await searchWinners(searchQuery.trim());
            setResults(res.data.winner || []);
            setMode('winners');
            setCurrentPage(1);
        } catch (error) {
            console.error("Error searching:", error);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.max(1, Math.ceil(results.length / ITEMS_PER_PAGE));
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedResults = results.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages, currentPage]);

    const goToPage = (page) => {
        setCurrentPage(page);
        setExpandedIndex(null);
    };

    const toggleCard = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <>
            {/* Header */}
            <header className="p-4 relative z-10 mt-18">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <h1 className="text-xl font-bold orbitron">Results & Winners</h1>
                    </div>
                    <div className="text-sm text-gray-300">
                        <span id="total-draws">{results.length}</span> results
                    </div>
                </div>
            </header>

            {/* Search and Filters  */}
            <div className="p-4 pb-2">
                <div className="glass-card rounded-2xl p-4 mb-4">
                    <div className="space-y-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Search by wallet address"
                                className="search-input w-full px-4 py-3 rounded-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="flex space-x-2 flex-wrap overflow-x-hidden pb-2" id='search-box'>
                            {['all', 'today', 'week', 'month', 'jackpot'].map((filter) => (
                                <button
                                    key={filter}
                                    className={`filter-button ${activeFilter === filter ? 'active' : ''} px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap mb-2`}
                                    onClick={() => {
                                        setActiveFilter(filter);
                                        setResults(applyFilter(allResults, filter));
                                        setMode('sorteos');
                                        setCurrentPage(1);
                                    }}
                                >
                                    {filter === 'all' ? 'All Results' : filter === 'today' ? 'Today' : filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'Jackpots'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results List  */}
            <div className="p-4 pt-0">
                <div className="space-y-4" id="results-container">
                    {loading ? (
                        <div className="text-gray-400 text-center py-8">Loading results...</div>
                    ) : results.length === 0 ? (
                        <div className="text-gray-400 text-center py-8">No results found.</div>
                    ) : (
                        paginatedResults.map((result, index) => {
                            const sorteo = mode === 'sorteos' ? result : result.idSorteo;
                            const expanded = expandedIndex === index;
                            const firstTwoDecimals = (price) => {
                                if (price === undefined || price === null) return '--';
                                const decPart = price.toString().split('.')[1] || '';
                                return decPart.padEnd(2, '0').slice(0, 2);
                            };
                            const btcDigits = firstTwoDecimals(sorteo?.precioBitcoin);
                            const ethDigits = firstTwoDecimals(sorteo?.precioEthereum);

                            return (
                                <div key={result._id || index} className="result-card glass-card rounded-2xl p-4" onClick={() => toggleCard(index)}>
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
                                            <span className="text-sm text-gray-400">Winning Numbers:</span>
                                            <span className="winning-number bitcoin-number"><div className='flex space-x-1'><img src={LogoBitcoin} alt="Bitcoin" className="w-5 h-5" /><div>{btcDigits}</div></div></span>
                                            <span className="winning-number ethereum-number"><div className='flex space-x-1'><img src={LogoEthereum} alt="Ethereum" className="w-5 h-5" /><div>{ethDigits}</div></div></span>
                                        </div>
                                    </div>

                                    <div className={`winner-details ${expanded ? 'expanded' : ''}`}>
                                        <div className="border-t border-gray-700 pt-3 mt-3">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <div className="text-gray-400">Prize per Winner</div>
                                                    <div className="font-bold text-green-400">{sorteo?.montoGanadoPorUsuario || '0'} TON</div>
                                                </div>
                                                {mode === 'winners' ? (
                                                    <div>
                                                        <div className="text-gray-400">Winner Wallet</div>
                                                        <div className="font-bold text-sm">{result.idUser?.wallet ? result.idUser.wallet.slice(0, 8) + '...' : '-'}</div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="text-gray-400">Total Prize</div>
                                                        <div className="font-bold text-green-400">{Number(sorteo?.montoPremio || 0).toFixed(2)} TON</div>
                                                    </div>
                                                )}
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

                    {!loading && results.length > ITEMS_PER_PAGE && (
                        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
                            <button
                                className="filter-button px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Prev
                            </button>
                            <div className="flex items-center space-x-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        className={`filter-button ${currentPage === page ? 'active' : ''} w-9 h-9 rounded-lg text-sm font-medium`}
                                        onClick={() => goToPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                className="filter-button px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Results
