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

// Datos de referidos (lista de referidos directos)
export const getReferralData = async (id) => api.get(`/getreferraldata/${id}`)

// Sistema de comisiones de referidos
export const getReferralBalance = async () => api.get(`/referral/balance`)
export const getReferralPayouts = async () => api.get(`/referral/payouts`)
export const claimReferralCommissions = async () => api.post(`/referral/claim`)

// Actualizar wallet del usuario
export const updateWallet = async (data) => api.put(`/wallet`, data)

// --- Endpoints de admin (requieren JWT + ser Admin con wallet matching) ---
//   Si el usuario no es admin, devuelven 403 y los componentes silencian.
//
// Etapa 5.6: los endpoints SENSIBLES (approve/reject/unsuspend/drain) aceptan
// un `adminToken` opcional. Si esta presente, sobreescribe el JWT del header
// con el admin JWT corto (1h, post connect-proof). Si no, usan el JWT regular.
// Cuando el backend tiene REQUIRE_ADMIN_PROOF=true, los sensibles RECHAZAN
// requests sin admin token.
const adminHeader = (adminToken) =>
    adminToken ? { Authorization: `Bearer ${adminToken}` } : {};

export const getAdminPendingApprovals = async () => api.get(`/admin/pending-approvals`)
export const approveWinnerPayout = async (payoutId, adminToken) =>
    api.post(`/admin/approve/${payoutId}`, {}, { headers: adminHeader(adminToken) })
export const rejectWinnerPayout = async (payoutId, reason, adminToken) =>
    api.post(`/admin/reject/${payoutId}`, { reason }, { headers: adminHeader(adminToken) })

// Etapa 5.5/5.6: payouts suspendidos por cap_exceeded -> unsuspend manual
export const getAdminSuspendedPayouts = async () => api.get(`/admin/payouts/suspended`)
export const unsuspendWinnerPayout = async (payoutId, adminToken) =>
    api.post(`/admin/payouts/${payoutId}/unsuspend`, {}, { headers: adminHeader(adminToken) })

// Etapa 5.6: connect-proof (login fuerte de admin)
export const getProofPayload = async () => api.get(`/admin/proof-payload`)
export const submitConnectProof = async (data) => api.post(`/admin/connect-proof`, data)
