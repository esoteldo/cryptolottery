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
    
    const [loaderPrice,setLoaderPrice]=useState(false);

    useEffect(()=>{
        const binancePrices=new getBinancePrice(setPrices);
  
        binancePrices.getPrices(setPrices);
        setLoaderPrice(false);
    
        const interval=setInterval(()=>{
            
        binancePrices.getPrices(setPrices);
        
        },30000);
        
        return()=>{
            //cleanup function
            clearInterval(interval);
            binancePrices.prices.close();
            console.log("WebSockets closed");
             /* setLoaderPrice(false); */

        }
    },[])
    
   


    return(
        <getPricesContext.Provider value={
            {prices,
             setPrices,
             loaderPrice,
             setLoaderPrice
            }}
             >
            {children}
        </getPricesContext.Provider>
    )
}