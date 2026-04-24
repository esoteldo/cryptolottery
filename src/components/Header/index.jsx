import LogoBitcoin from "../../assets/images/bitcoin-btc-logo.svg"
import LogoEthereum from "../../assets/images/ethereum-eth-logo.svg"
import LogoTon from "../../assets/images/toncoin-ton-logo.svg"
import "./styles.css"
import { useEffect, useState } from "react"
import { useGetInitData } from "../../context/getInitDataContext"

const Header = () => {
    const {initData, initializedData} = useGetInitData();

    const [porcentajeBtc, setPorcentajeBtc] = useState(0);
    const [porcentajeEth, setPorcentajeEth] = useState(0);
    const [porcentajeTon, setPorcentajeTon] = useState(0);
    const [precioBtc, setPrecioBtc] = useState(0);
    const [precioEth, setPrecioEth] = useState(0);
    const [precioTon, setPrecioTon] = useState(0);

    // Formatea precio: separa parte entera (con comas) y 2 decimales
    const formatPrice = (price) => {
        const num = parseFloat(price);
        if (isNaN(num)) return { integer: '0', decimals: '00' };
        const parts = num.toFixed(2).split('.');
        return {
            integer: parseInt(parts[0]).toLocaleString(),
            decimals: parts[1]
        };
    };

    useEffect(() => {
        if(initializedData && initData?.datahome){
            const home = initData.datahome;
            setPorcentajeBtc(parseFloat(home.porcentajeBitcoin).toFixed(2));
            setPorcentajeEth(parseFloat(home.porcentajeEthereum).toFixed(2));
            setPorcentajeTon(parseFloat(home.porcentajeTon).toFixed(2));
            setPrecioBtc(home.valorBitcoin);
            setPrecioEth(home.valorEthereum);
            setPrecioTon(home.valorTon);
        }
    }, [initData, initializedData]);

  return (
    <>
        <header className="fixed top-7 left-0 right-0 bg-black bg-opacity-30 backdrop-blur-lg border-t border-gray-800 z-50">
            <div className="flex items-center justify-between left-2 right-2 py-2 px-4">
                <div className="flex items-center space-x-3">
                    <svg viewBox="0 0 40 40" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="cl-logo-gradient" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#f97316"/>
                                <stop offset="100%" stopColor="#3b82f6"/>
                            </linearGradient>
                        </defs>
                        <circle cx="20" cy="20" r="19" fill="url(#cl-logo-gradient)"/>
                        <circle cx="20" cy="20" r="16" fill="#0d0d0d"/>
                        <text x="15.25" y="26" textAnchor="middle" dominantBaseline="alphabetic" fontFamily="Orbitron, sans-serif" fontWeight="900" fontSize="18" fill="url(#cl-logo-gradient)">C</text>
                        <text x="27.25" y="26" textAnchor="middle" dominantBaseline="alphabetic" fontFamily="Orbitron, sans-serif" fontWeight="900" fontSize="11" fill="url(#cl-logo-gradient)">L</text>
                    </svg>
                    <h1 className="text-xl font-bold orbitron">CryptoLottery</h1>
                </div>
                <div className="flex items-center space-x-2">
                   {initializedData ? (
                    <><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-300">Live</span></>
                   ) : (
                    <><div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-300">Offline</span></>
                   )}
                </div>
            </div>
        </header>

        <div className="max-h-7 bg-gray-900 bg-opacity-30 py-1 overflow-hidden top-0 fixed left-0 right-0 z-40 border-b border-gray-800">
           {initializedData ? (
            <div className="price-ticker flex space-x-8 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                    <img src={LogoBitcoin} alt="Bitcoin" className="w-5 h-5"/>
                    <span className="font-semibold text-xs">BITCOIN</span>
                    <span className="crypto-price jetbrains text-xs">${formatPrice(precioBtc).integer}.<span className="last-digits">{formatPrice(precioBtc).decimals}</span></span>
                    {porcentajeBtc >= 0.00 ? (
                        <span className="trend-up text-sm">{`+${porcentajeBtc}%`}</span>
                    ) : (
                        <span className="trend-down text-sm">{`${porcentajeBtc}%`}</span>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <img src={LogoEthereum} alt="Ethereum" className="w-5 h-5"/>
                    <span className="font-semibold text-xs">ETHEREUM</span>
                    <span className="crypto-price jetbrains text-xs">${formatPrice(precioEth).integer}.<span className="last-digits">{formatPrice(precioEth).decimals}</span></span>
                    {porcentajeEth >= 0.00 ? (
                        <span className="trend-up text-sm">{`+${porcentajeEth}%`}</span>
                    ) : (
                        <span className="trend-down text-sm">{`${porcentajeEth}%`}</span>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <img src={LogoTon} alt="Toncoin" className="w-5 h-5"/>
                    <span className="font-semibold text-xs">TON</span>
                    <span className="crypto-price jetbrains text-xs">${formatPrice(precioTon).integer}.<span className="last-digits">{formatPrice(precioTon).decimals}</span></span>
                    {porcentajeTon >= 0.00 ? (
                        <span className="trend-up text-sm">{`+${porcentajeTon}%`}</span>
                    ) : (
                        <span className="trend-down text-sm">{`${porcentajeTon}%`}</span>
                    )}
                </div>
            </div>
           ) : (
            <div className="price-ticker flex space-x-8 whitespace-nowrap">
                <span className="text-xs text-gray-500">Connecting to price feed...</span>
            </div>
           )}
        </div>
    </>
  )
}

export default Header
