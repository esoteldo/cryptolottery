import { createContext, useContext } from "react";

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

    
   


    return(
        <getTelegramDataContext.Provider value={
            {

            }}
             >
            {children}
        </getTelegramDataContext.Provider>
    )
}