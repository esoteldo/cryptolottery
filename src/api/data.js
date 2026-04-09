import axios from "axios"
import WebApp from '@twa-dev/sdk'

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

// Instancia de axios con interceptores para auth
const api = axios.create({
    baseURL: API,
    withCredentials: true
});

// Interceptor: agregar JWT token y Telegram initData a cada request
api.interceptors.request.use((config) => {
    // Agregar JWT token si existe
    const token = sessionStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Agregar initData de Telegram para validacion en el servidor
    if (WebApp.initData) {
        config.headers['X-Telegram-Init-Data'] = WebApp.initData;
    }

    return config;
});

// Interceptor de respuesta: manejar 401/403 (token expirado)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Token expirado o inválido - limpiar
            sessionStorage.removeItem('auth_token');
        }
        return Promise.reject(error);
    }
);

// --- Endpoints publicos (sin auth requerido) ---

// Datos iniciales (precios + ganadores recientes)
export const getInitData = async (id) => api.get(`/getinitdata/${id}`)

// Ultimos ganadores
export const getWinners = async () => api.get(`/winners`)

// Sorteos procesados (cerrados)
export const getProcessedSorteos = async () => api.get(`/sorteos`)

// Buscar ganadores por wallet
export const searchWinners = async (wallet) => api.get(`/searchwinners?wallet=${wallet}`)

// --- Endpoints de autenticacion ---

// Login / registro de usuario (envía initData de Telegram)
export const loginOrRegister = async (data) => api.post(`/session`, data)

// --- Endpoints protegidos (requieren JWT) ---

// Compra de tickets
export const createTransaction = async (data) => api.post(`/transaction`, data)

// Historial de tickets del usuario
export const getTickets = async (wallet) => api.get(`/gettransaccions/${wallet}`)

// Datos de referidos
export const getReferralData = async (id) => api.get(`/getreferraldata/${id}`)

// Actualizar wallet del usuario
export const updateWallet = async (data) => api.put(`/wallet`, data)
