import { createContext, useContext, useEffect, useState } from "react";

import { getInitData } from "../api/data";
import { useGetTelegramData } from "./getTelegramDataContext";
import { errorInitData } from "../helpers/sweetAlert";
import getRandomNumber from "../helpers/getRandomNumber";

// eslint-disable-next-line react-refresh/only-export-components
export const getInitDataContext=createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useGetInitData=()=>{
    const context=useContext(getInitDataContext);
    if(!context){
        throw new Error("useGetInitData must be used within an AuthProvider")
    }
    return context;
}

export const GetInitDataProvider=({children})=>{

    
    const {userData, initializedUser}=useGetTelegramData();
    const [initData, setInitData]=useState(null);
    const [initializedData, setInitializedData]=useState(false);


    useEffect( () => {
        
        try{
        const fetchData=async(id)=>{
                     const data=await getInitData(id);
                     setInitData(data.data.datahome);

                     setInitializedData(true);
                 }
        
            if(initializedUser){
                const id=userData.id;
                 
                 fetchData(id);
                 
            }else{
                //TODO: manejar el caso cuando no se ha inicializado el usuario
                const id=getRandomNumber(10);
                fetchData(id).then(()=>{
                    console.log("Init data fetched for random id:", initData);
                });
                
            }

            const interval=setInterval(()=>{
                if(initializedUser){
                    const id=userData.id;
                    fetchData(id);
                }else{
                    const id=getRandomNumber(10);
                    fetchData(id);
                }
            },310000); //5 minutes interval
            return()=>{
                clearInterval(interval);
            }
            
         }catch(error){
             console.error("Error fetching init data:", error);
             errorInitData(error.message);
             setInitializedData(false);

         }
      
    }, [])
    

     
    
   


    return(
        <getInitDataContext.Provider value={
            {
                initData,
                initializedData
            }}
             >
            {children}
        </getInitDataContext.Provider>
    )
}