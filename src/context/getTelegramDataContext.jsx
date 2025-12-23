import { createContext, useContext, useEffect, useState } from "react";
import WebApp from '@twa-dev/sdk';
import { noTelegramId } from "../helpers/sweetAlert";

// eslint-disable-next-line react-refresh/only-export-components
export const getTelegramDataContext=createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useGetTelegramData=()=>{
    const context=useContext(getTelegramDataContext);
    if(!context){
        throw new Error("useGetTelegramData must be used within an AuthProvider")
    }
    return context;
}

export const GetTelegramDataProvider=({children})=>{

    const [userData, setUserData]=useState({
        id:null,
        first_name:null,
        last_name:null,
        username:null,
        language_code:null
    })
    const [initializedUser, setInitializedUser]=useState(false);

    useEffect(() => {
    if(WebApp.initDataUnsafe.user){
      //data del usuario de telegram
      setInitializedUser(true);
      setUserData(WebApp.initDataUnsafe.user)
    }else{
        console.log("no telegram user data found");
        noTelegramId('no telegram user data found');
      setInitializedUser(false);
    }
  }, [])

    
   


    return(
        <getTelegramDataContext.Provider value={
            {
                userData,
                initializedUser

            }}
             >
            {children}
        </getTelegramDataContext.Provider>
    )
}