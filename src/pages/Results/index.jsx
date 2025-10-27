import './styles.css';
import LogoBitcoin from '../../assets/images/bitcoin-btc-logo.svg';
import LogoEthereum from '../../assets/images/ethereum-eth-logo.svg';
import { useState } from 'react';

const Results = () => {


    const [jackpot, setJackpot] = useState(true);
    const [expanded, setExpanded] = useState(false);

    const toggleCard = () => {
        setExpanded(!expanded);
    };

  return (
    <>
       {/* Header */}
    <header className="p-4 relative z-10 mt-18">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                {/* <a href="index.html" className="text-white hover:text-orange-400 transition-colors">
                    ← Back
                </a> */}
                <h1 className="text-xl font-bold orbitron">Results & Winners</h1>
            </div>
            <div className="text-sm text-gray-300">
                <span id="total-draws">156</span> draws
            </div>
        </div>
    </header>

     {/* Search and Filters  */}
    <div className="p-4 pb-2" >
        <div className="glass-card rounded-2xl p-4 mb-4">
            <div className="space-y-4">
                <div>
                    <input type="text" placeholder="Search by numbers (e.g., 42,23)" className="search-input w-full px-4 py-3 rounded-lg" id="search-input" />
                </div>
                <div className="flex space-x-2 flex-wrap overflow-x-hidden pb-2" id='search-box'>
                    <button className="filter-button active px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap mb-2" data-filter="all">All Results</button>
                    <button className="filter-button px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap mb-2" data-filter="today">Today</button>
                    <button className="filter-button px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap mb-2" data-filter="week">This Week</button>
                    <button className="filter-button px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap mb-2" data-filter="month">This Month</button>
                    <button className="filter-button px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap mb-2" data-filter="jackpot">Jackpots</button>
                </div>
            </div>
        </div>
    </div>

    {/*  Statistics Dashboard  */}
    <div className="p-4 pb-2">
        <div className="glass-card rounded-2xl p-4 mb-4">
            <h3 className="text-lg font-bold mb-4 orbitron">Lottery Statistics</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="stat-card">
                    <div className="stat-value orbitron" id="total-prizes">$2.8M</div>
                    <div className="text-sm text-gray-400">Total Prizes</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value orbitron" id="total-winners">1,247</div>
                    <div className="text-sm text-gray-400">Winners</div>
                </div>
            </div>
           {/*  <div className="chart-container" id="frequency-chart"></div> */}
        </div>
    </div>

     {/* Results List  */}
    <div className="p-4 pt-0">
        <div className="space-y-4" id="results-container">
             {/* Results will be populated by JavaScript */} 
                <div className="result-card glass-card rounded-2xl p-4" onClick={toggleCard}>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="font-bold text-lg orbitron">Draw #{'11'}</div>
                                <div className="text-sm text-gray-400">{'11/3/2025'}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-green-400">${'3000'}</div>
                                <div className="text-xs text-gray-400">{'2'} winners</div>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-400">Winning Numbers:</span>
                                <span className="winning-number bitcoin-number"><div className='flex space-x-1'><img src={LogoBitcoin} alt="Bitcoin" className="w-5 h-5"/><div>{'42'}</div></div></span>
                                <span className="winning-number ethereum-number"><div className='flex space-x-1'><img src={LogoEthereum} alt="Ethereum" className="w-5 h-5"/><div>{'82'}</div></div></span>
                            </div>
                            {jackpot ? (<div className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">JACKPOT</div>) : ''}
                        </div>
                        
                        <div className={`winner-details ${expanded ? 'expanded' : ''}`}>
                            <div className="border-t border-gray-700 pt-3 mt-3">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-gray-400">Total Prizes Distributed</div>
                                        <div className="font-bold text-green-400">${"Total prizes"}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400">Average Prize per Winner</div>
                                        <div className="font-bold">${'Promedio por Ganador'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-center mt-2">
                            <div className="text-xs text-gray-400">Tap to {expanded ? 'collapse' : 'expand'}</div>
                        </div>
                    </div> 
        </div>
        
         {/* Load More Button */}
        <div className="text-center mt-6">
            <button className="bg-white bg-opacity-10 hover:bg-opacity-20 px-6 py-3 rounded-lg font-medium transition-all" id="load-more">
                Load More Results
            </button>
        </div>
    </div>
    </>
  )
}

export default Results