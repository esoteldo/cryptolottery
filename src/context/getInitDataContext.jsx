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

        const fetchData=async(id)=>{
            try {
                const data=await getInitData(id);
                setInitData(data.data);
                setInitializedData(true);
            } catch(error) {
                console.error("Error fetching init data:", error);
                errorInitData(error.message);
                setInitializedData(false);
            }
        }

        const id = initializedUser ? userData.id : getRandomNumber(10);
        fetchData(id);

        const interval=setInterval(()=>{
            const id = initializedUser ? userData.id : getRandomNumber(10);
            fetchData(id);
        }, 310000);

        return()=>{
            clearInterval(interval);
        }

    }, [initializedUser, userData.id])
    

     
    
   


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