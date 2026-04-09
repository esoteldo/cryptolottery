import LogoBitcoin from "../../assets/images/bitcoin-btc-logo.svg";
import LogoEthereum from "../../assets/images/ethereum-eth-logo.svg";
import { useGetInitData } from "../../context/getInitDataContext";
import "./styles.css";

const RecentWinners = () => {
    const { initData, initializedData } = useGetInitData();

    const lastTwoDigits = (price) => {
        if (price === undefined || price === null) return '--';
        const intPart = price.toString().split('.')[0];
        return intPart.slice(-2).padStart(2, '0');
    };

    // Transformar datos del backend al formato del componente
    const winners = initializedData && initData?.winners
        ? initData.winners.map((w) => ({
            inicial: w.idUser?.wallet ? w.idUser.wallet.slice(0, 2).toUpperCase() : '?',
            wallet: w.idUser?.wallet
                ? w.idUser.wallet.slice(0, 6) + '...' + w.idUser.wallet.slice(-4)
                : 'Unknown',
            montoPremio: w.idSorteo?.montoGanadoPorUsuario || '0',
            fechaPremio: w.idSorteo?.fecha || '',
            numeroSorteo: w.idSorteo?.numeroSorteo || '-',
            numeroGanadorBtc: lastTwoDigits(w.idSorteo?.precioBitcoin),
            numeroGanadorEth: lastTwoDigits(w.idSorteo?.precioEthereum)
        }))
        : [];

    return (
        /* Recent Winners  */
        <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4 orbitron">Recent Winners</h3>
            <div className="flex space-x-4 overflow-x-auto pb-4" id="winners-carousel">
                {winners.length > 0 ? winners.map((winner, index) => (
                    <div key={index} className="winner-card glass-card rounded-xl p-4 min-w-[220px] flex-shrink-0">
                        <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">{winner.inicial}</span>
                            </div>
                            <div className="font-semibold text-sm">{winner.wallet}</div>
                        </div>
                        <div className="text-lg font-bold orbitron text-green-400 mb-1">{winner.montoPremio} TON</div>
                        <div className="flex space-between items-center mb-2">
                            <div className="text-xs text-gray-400 m-1">Draw No: {winner.numeroSorteo}</div>
                            <div className="text-xs text-gray-400 m-1">{winner.fechaPremio}</div>
                        </div>

                        <div className="flex justify-between text-xs">
                            <span className="flex text-orange-400"><img src={LogoBitcoin} alt="Bitcoin" className="w-5 h-5" />{winner.numeroGanadorBtc}</span>
                            <span className="flex text-blue-400"><img src={LogoEthereum} alt="Ethereum" className="w-5 h-5" />{winner.numeroGanadorEth}</span>
                        </div>
                    </div>
                )) : (
                    <div className="text-gray-400 text-sm py-4">No winners yet. Be the first!</div>
                )}
            </div>
        </div>
    )
}

export default RecentWinners
