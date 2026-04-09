import { createContext, useContext, useEffect, useState } from "react";
import { getBinancePrice } from "../helpers/getBinancePrice";

// eslint-disable-next-line react-refresh/only-export-components
export const getPricesContext=createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useGetPrices=()=>{
    const context=useContext(getPricesContext);
    if(!context){
        throw new Error("useGetPrices must be used within an AuthProvider")
    }
    return context;
}

export const GetPricesProvider=({children})=>{

     const [prices, setPrices]=useState({
        btc:0,
        eth:0,
        ton:0
    });

    const [shareModal, setShareModal]=useState(false);
    
    const [loaderPrice,setLoaderPrice]=useState(false);

    useEffect(() => {
        if(prices.btc!==0 && prices.eth!==0 && prices.ton!==0){
            setLoaderPrice(true);
        }else{
            setLoaderPrice(false);
        }
    }, [prices, setLoaderPrice]);

    useEffect(()=>{

        const binancePrices=new getBinancePrice(setPrices);

        return()=>{
            binancePrices.prices.close();
        }
    },[])


    return(
        <getPricesContext.Provider value={
            {prices,
             setPrices,
             loaderPrice,
             setLoaderPrice,
             shareModal,
             setShareModal
            }}
             >
            {children}
        </getPricesContext.Provider>
    )
}