import { useState } from 'react';
import './styles.css';
import '../Results/styles.css';
import LogoBitcoin from '../../assets/images/bitcoin-btc-logo.svg';
import LogoEthereum from '../../assets/images/ethereum-eth-logo.svg';

const Tickets = () => {

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
                <h1 className="text-xl font-bold orbitron">Your Tickets</h1>
            </div>
            <div className="text-sm text-gray-300">
                <span id="total-cost">Total  0</span>
            </div>
        </div>
    </header>

     {/* Main Content */}
    <div className="p-4 pb-32">
        

        {/* Ticket Options */}
        <div className="glass-card rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 orbitron">Tickets History</h3><div className="result-card glass-card rounded-2xl p-4" onClick={toggleCard}>
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
    </div>

     {/* Sticky Purchase Button  */}
    {/* <div className="ticket-summary px-4">
        <button id="purchase-button" className="buy-button w-full py-4 rounded-lg text-white font-bold text-lg orbitron disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            SELECT NUMBERS TO CONTINUE
        </button>
    </div> */}
    </>
  )
}

export default Tickets