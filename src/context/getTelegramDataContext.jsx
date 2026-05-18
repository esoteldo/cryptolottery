import { createContext, useContext, useEffect, useState } from "react";
import WebApp from '@twa-dev/sdk';
import { noTelegramId } from "../helpers/sweetAlert";
import { loginOrRegister } from "../api/data";

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
    const [authToken, setAuthToken]=useState(null);

    useEffect(() => {
        if(WebApp.initDataUnsafe.user){
            // Data del usuario de telegram
            setInitializedUser(true);
            setUserData(WebApp.initDataUnsafe.user);

            // Registrar/login en el backend
            const initSession = async () => {
                try {
                    const user = WebApp.initDataUnsafe.user;
                    const startParam = WebApp.initDataUnsafe.start_param || null;

                    const response = await loginOrRegister({
                        idTelegram: user.id.toString(),
                        languaje: user.language_code || 'en',
                        region: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
                        idReferal: startParam,
                        // Alias (@usuario) y nombre de pila de Telegram. El backend
                        // los persiste y los devuelve en winners/referrals para
                        // mostrarlos en vez de la wallet truncada. Pueden ser null
                        // si el user no tiene @alias configurado.
                        username: user.username || null,
                        firstName: user.first_name || null
                    });

                    if (response.data?.token) {
                        setAuthToken(response.data.token);
                        // Guardar token en sessionStorage
                        sessionStorage.setItem('auth_token', response.data.token);
                    }
                } catch (error) {
                    console.error('Error initializing session:', error);
                }
            };

            initSession();
        } else {
            noTelegramId('no telegram user data found');
            setInitializedUser(false);
        }
    }, [])


    return(
        <getTelegramDataContext.Provider value={
            {
                userData,
                initializedUser,
                authToken

            }}
             >
            {children}
        </getTelegramDataContext.Provider>
    )
}