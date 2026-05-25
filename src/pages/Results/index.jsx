import './styles.css';
import LogoBitcoin from '../../assets/images/bitcoin-btc-logo.svg';
import LogoEthereum from '../../assets/images/ethereum-eth-logo.svg';
import { useEffect, useState } from 'react';
import { getProcessedSorteos, searchWinners } from '../../api/data';

// Busqueda por wallet: oculta hasta retomar la feature (desarrollo posterior).
// Poner en true reactiva el input + el flujo searchWinners ya implementado.
const SEARCH_ENABLED = false;

const Results = () => {
    const [results, setResults] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [mode, setMode] = useState('sorteos'); // 'sorteos' | 'winners' (winners detras de SEARCH_ENABLED)
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // Paginacion + filtro server-side. El backend aplica el filtro y devuelve
    // solo la pagina pedida + total/totalPages.
    const fetchResults = async (page, filter) => {
        try {
            setLoading(true);
            const res = await getProcessedSorteos(page, ITEMS_PER_PAGE, filter);
            setResults(res.data.sorteos || []);
            setTotal(res.data.total || 0);
            setTotalPages(res.data.totalPages || 1);
            setMode('sorteos');
        } catch (error) {
            console.error("Error fetching results:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults(currentPage, activeFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, activeFilter]);

    const handleSearch = async () => {
        // Busqueda por wallet: detras de SEARCH_ENABLED (desarrollo posterior).
        // No paginada server-side aun; muestra el set completo de searchWinners.
        if (!searchQuery.trim()) {
            setActiveFilter('all');
            setCurrentPage(1);
            return;
        }
        try {
            setLoading(true);
            const res = await searchWinners(searchQuery.trim());
            const found = res.data.winner || [];
            setResults(found);
            setTotal(found.length);
            setTotalPages(1);
            setMode('winners');
        } catch (error) {
            console.error("Error searching:", error);
        } finally {
            setLoading(false);
        }
    };

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
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
                        <span id="total-draws">{total}</span> results
                    </div>
                </div>
            </header>

            {/* Search and Filters  */}
            <div className="p-4 pb-2">
                <div className="glass-card rounded-2xl p-4 mb-4">
                    <div className="space-y-4">
                        {SEARCH_ENABLED && (
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
                        )}
                        <div className="flex space-x-2 flex-wrap overflow-x-hidden pb-2" id='search-box'>
                            {['all', 'today', 'week', 'month', 'jackpot'].map((filter) => (
                                <button
                                    key={filter}
                                    className={`filter-button ${activeFilter === filter ? 'active' : ''} px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap mb-2`}
                                    onClick={() => {
                                        // Reset a pagina 1 y cambio de filtro; el useEffect refetchea.
                                        setActiveFilter(filter);
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
                        results.map((result, index) => {
                            const sorteo = mode === 'sorteos' ? result : result.idSorteo;
                            const expanded = expandedIndex === index;
                            const firstTwoDecimals = (price) => {
                                if (price === undefined || price === null) return '--';
                                const decPart = price.toString().split('.')[1] || '';
                                return decPart.padEnd(2, '0').slice(0, 2);
                            };
                            const btcDigits = firstTwoDecimals(sorteo?.precioBitcoin);
                            const ethDigits = firstTwoDecimals(sorteo?.precioEthereum);

                            // Prize per winner: si el backend ya lo calculo (montoGanadoPorUsuario),
                            // usamos ese. Si no (viene 0/null pero hubo ganadores), lo derivamos
                            // de montoPremio / ganadores. Con 1 ganador = premio completo.
                            const totalPrize = Number(sorteo?.montoPremio || 0);
                            const numGanadores = Number(sorteo?.ganadores || 0);
                            const perWinnerStored = Number(sorteo?.montoGanadoPorUsuario || 0);
                            const prizePerWinner = perWinnerStored > 0
                                ? perWinnerStored
                                : (numGanadores > 0 ? totalPrize / numGanadores : 0);

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
                                                    <div className="font-bold text-green-400">{prizePerWinner.toFixed(2)} TON</div>
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

                    {!loading && totalPages > 1 && (
                        <div className="glass-card rounded-2xl p-4 mb-24 flex items-center justify-between">
                            <button
                                className="filter-button px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Prev
                            </button>
                            <div className="text-sm text-gray-300 font-medium">
                                Page {currentPage} of {totalPages}
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
