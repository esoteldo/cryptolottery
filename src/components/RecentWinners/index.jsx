import { useState } from "react";
import LogoBitcoin from "../../assets/images/bitcoin-btc-logo.svg";
import LogoEthereum from "../../assets/images/ethereum-eth-logo.svg";
import "./styles.css";



const RecentWinners = () => {

   const winner = {
    inicial: "J",
    nombre: "Jorge Bencomo",
    wallet: "0x1234...abcd",
    montoPremio: "5000",
    fechaPremio: "2023-10-10",
    numeroGanadorBtc: "45",
    numeroGanadorEth: "32"
};

const winner2 = {
    inicial: "E",
    nombre: "Enrique Bencomo",
    wallet: "0x1234...abcd",
      montoPremio: "3000",
      fechaPremio: "2023-10-10",
      numeroGanadorBtc: "12",
      numeroGanadorEth: "78"
};

const [winners, setWinners] = useState([winner, winner2]);

    return (
        /* Recent Winners  */
        <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4 orbitron">Recent Winners</h3>
            <div className="flex space-x-4 overflow-x-auto pb-4" id="winners-carousel">
                {/* Winner cards  */}
                {winners.map((winner, index) => (
                    <div key={index} className="winner-card glass-card rounded-xl p-4 min-w-[220px] flex-shrink-0">
                        <div className="flex items-center space-x-2 mb-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">{winner.inicial}</span>
                              </div>
                              <div className="font-semibold text-sm">{winner.nombre}</div>
                        </div>
                        <div className="text-lg font-bold orbitron text-green-400 mb-1">${winner.montoPremio}</div>
                        <div className="text-xs text-gray-400 mb-2">Wallet: {winner.wallet}</div>
                        <div className="flex space-between items-center mb-2">
                              <div className="text-xs text-gray-400  m-1 ">Draw No: 123</div>
                              <div className="text-xs text-gray-400  m-1">{winner.fechaPremio}</div>
                           
                        </div>
                        
                        <div className="flex justify-between text-xs">
                              <span className="flex text-orange-400"><img src={LogoBitcoin} alt="Bitcoin" className="w-5 h-5"/>{winner.numeroGanadorBtc}</span>
                              <span className="flex text-blue-400"><img src={LogoEthereum} alt="Ethereum" className="w-5 h-5"/>{winner.numeroGanadorEth}</span>
                        </div>

                    </div>
                ))}
                  {/* ****************** */}
                
            </div>
        </div>
    )
}

export default RecentWinners
