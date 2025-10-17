import { useGetPrices } from "../../context/getPricesContext"
import LogoBitcoin from "../../assets/images/bitcoin-btc-logo.svg"
import LogoEthereum from "../../assets/images/ethereum-eth-logo.svg"
import LogoTon from "../../assets/images/toncoin-ton-logo.svg"
import "./styles.css"
import { useEffect, useState } from "react"

const Header = () => {

    const {prices,loaderPrice,setLoaderPrice}=useGetPrices();
    console.log("Renderizando Header");
    /* console.log(prices,loaderPrice); */
    useEffect(() => {
        if(prices.btc!==0 && prices.eth!==0 && prices.ton!==0){
            setLoaderPrice(true);
        }else{
            setLoaderPrice(false);
        }
    }, [prices, setLoaderPrice]);
    const [porcentajeBtc,setPorcentajeBtc]=useState(0);
    const [porcentajeEth,setPorcentajeEth]=useState(0);
    const [porcentajeTon,setPorcentajeTon]=useState(0);
    
    useEffect(() => {
        const datoAnterior=JSON.parse(localStorage.getItem('prices'));
        if(datoAnterior){
            if(datoAnterior.btc!==prices.btc ){
                setPorcentajeBtc(((prices.btc - datoAnterior.btc) / datoAnterior.btc * 100).toFixed(2));
            }else{
                setPorcentajeBtc(0);
            }
            if(datoAnterior.eth!==prices.eth ){
                setPorcentajeEth(((prices.eth - datoAnterior.eth) / datoAnterior.eth * 100).toFixed(2));
            }else{
                setPorcentajeEth(0);
            }
            if(datoAnterior.ton!==prices.ton ){
                setPorcentajeTon(((prices.ton - datoAnterior.ton) / datoAnterior.ton * 100).toFixed(2));
            }else{
                setPorcentajeTon(0);
            }
        }
      localStorage.setItem('prices', JSON.stringify(prices));
    
      return () => {
        
      }
    }, [prices])
    
    
    

  return (
    <>
         {/* Header  */}
        
        <header className=" fixed top-7 left-0 right-0 bg-black bg-opacity-30 backdrop-blur-lg border-t border-gray-800 z-50">
            <div className="flex items-center justify-between left-2 right-2 py-2 px-4">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">₿</span>
                    </div>
                    <h1 className="text-xl font-bold orbitron">CryptoLottery</h1>
                </div>
                <div className="flex items-center space-x-2">
                   {loaderPrice?( <><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-300">Live</span></>):(<>
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-300">Offline</span></>)}
                </div>
            </div>
        </header>

         {/* Live Price Ticker */}
        <div className="max-h-7 bg-gray-900 bg-opacity-30 py-1 overflow-hidden top-0 fixed left-0 right-0 z-40 border-b border-gray-800">
           {loaderPrice?(<div className="price-ticker flex space-x-8 whitespace-nowrap ">
                <div className="flex items-center space-x-2 ">
                    <img src={LogoBitcoin} alt="Bitcoin" className="w-5 h-5"/>
                    <span className="font-semibold text-xs">BITCOIN</span>
                    <span className="crypto-price jetbrains text-xs" id="bitcoin-price">${parseInt(prices.btc).toLocaleString()+"."}<span className="last-digits">{prices.btc?prices.btc.slice(-2):''}</span></span>

                {porcentajeBtc>=0.00?(<span className="trend-up text-sm">{`↗ +${porcentajeBtc}%`}</span>):(<span className="trend-down text-sm">{`↘ ${porcentajeBtc}%`}</span>)}
                </div>
                <div className="flex items-center space-x-2">
                    <img src={LogoEthereum} alt="Ethereum" className="w-5 h-5"/>
                    <span className="font-semibold text-xs">ETHEREUM</span>
                    <span className="crypto-price jetbrains text-xs" id="ethereum-price">${parseInt(prices.eth).toLocaleString()+"."}<span
                        className="last-digits"
                        >{prices.eth?prices.eth.slice(-2):''}</span></span>
                    {porcentajeEth>=0.00?(<span className="trend-up text-sm">{`↗ +${porcentajeEth}%`}</span>):(<span className="trend-down text-sm">{`↘ ${porcentajeEth}%`}</span>)}
                </div>
                <div className="flex items-center space-x-2">
                    <img src={LogoTon} alt="Toncoin" className="w-5 h-5"/>
                    <span className="font-semibold text-xs">TON</span>
                    <span className="crypto-price jetbrains text-xs">${parseInt(prices.ton).toLocaleString()+"."}<span className="last-digits">{prices.ton?prices.ton.slice(-2):''}</span></span>
                    {porcentajeTon>=0.00?(<span className="trend-up text-sm">{`↗ +${porcentajeTon}%`}</span>):(<span className="trend-down text-sm">{`↘ ${porcentajeTon}%`}</span>)}
                </div>
            </div>):(<div className="price-ticker flex space-x-8 whitespace-nowrap "></div>)}
        </div>    
    </>
  )
}

export default Header