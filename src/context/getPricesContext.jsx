import { createContext, useContext, useEffect, useState } from "react";
import { getBinancePrice } from "../helpers/getBinancePrice";
import { getInitData } from "../api/data";

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

    

    const getHomeData=async()=>{
        
        try {
            const response=await getInitData(id);
            const data=await response.json();
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    }
    
   


    return(
        <getPricesContext.Provider value={
            {prices,
             getHomeData,
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