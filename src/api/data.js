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

// Interceptor de respuesta: manejar 401 (token expirado / inválido).
//
// IMPORTANTE: SOLO 401 limpia el token. 403 (Forbidden) significa que
// el token es valido pero el endpoint requiere permisos que el user no
// tiene (ej: endpoints admin para users no-admin). En 403 NO se limpia
// el token, sino el componente AdminApprovals deslogueaba al user comun
// al checkar si era admin.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
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

// Sorteos procesados (cerrados) — paginado server-side + filtro.
// filter: 'all' | 'today' | 'week' | 'month' | 'jackpot'
export const getProcessedSorteos = async (page = 1, limit = 5, filter = 'all') =>
    api.get(`/sorteos?page=${page}&limit=${limit}&filter=${filter}`)

// Buscar ganadores por wallet
export const searchWinners = async (wallet) => api.get(`/searchwinners?wallet=${wallet}`)

// --- Endpoints de autenticacion ---

// Login / registro de usuario (envía initData de Telegram)
export const loginOrRegister = async (data) => api.post(`/session`, data)

// --- Endpoints protegidos (requieren JWT) ---

// Intent de compra: PRE-firma. Devuelve { nonce, expiresAt } que el frontend
// incluye en el payload TonConnect ("lot:<nonce>") y en el POST /transaction
// final. Permite al cron orphan-recovery (Etapa 6.2) recuperar la compra si
// el flow se corta entre la firma y el POST.
export const createTransactionIntent = async (data) => api.post(`/transaction/intent`, data)

// Compra de tickets (POST-firma). Soporta nonce opcional para reclamar el intent.
export const createTransaction = async (data) => api.post(`/transaction`, data)

// Historial de tickets del usuario — paginado server-side.
export const getTickets = async (wallet, page = 1, limit = 5) =>
    api.get(`/gettransaccions/${wallet}?page=${page}&limit=${limit}`)

// Datos de referidos (lista de referidos directos)
export const getReferralData = async (id, page = 1, limit = 5) => api.get(`/getreferraldata/${id}?page=${page}&limit=${limit}`)

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

// --- Etapa 5.4: reconciliation y alertas ---
export const getReconciliationLatest  = async () => api.get(`/admin/reconciliation/latest`)
export const getReconciliationHistory = async (limit = 20) => api.get(`/admin/reconciliation/history?limit=${limit}`)
export const getActiveAlerts          = async () => api.get(`/admin/alerts`)
export const ackAlert                 = async (alertId, reason) => api.post(`/admin/alerts/${alertId}/ack`, { reason })

// --- Etapa 5.5: caps globales ---
export const getCaps              = async () => api.get(`/admin/caps`)
export const listCapOverrides     = async () => api.get(`/admin/caps/overrides`)
export const createCapOverride    = async (data) => api.post(`/admin/caps/override`, data)
export const revokeCapOverride    = async (overrideId, reason) => api.post(`/admin/caps/override/${overrideId}/revoke`, { reason })

// --- Etapa 5.3: drains + wallet balances ---
export const getWalletBalances    = async () => api.get(`/admin/wallet-balances`)
export const drainWallet          = async (data, adminToken) => api.post(`/admin/drain-wallet`, data, { headers: adminHeader(adminToken) })
export const getDrainStatus       = async (drainId) => api.get(`/admin/drain/${drainId}`)

// --- Etapa 6.3: rotacion de wallet de loteria ---
// Publico: wallet activa actual (a donde pagar). Sin auth.
export const getActiveLotteryWallet = async () => api.get(`/lottery/active-wallet`)
// Admin (lectura): catalogo de wallets (active/scheduled/retired).
export const listLotteryWallets     = async () => api.get(`/admin/lottery/wallets`)
// Admin sensible (proof): agendar / cancelar rotacion.
export const scheduleRotation       = async (data, adminToken) => api.post(`/admin/lottery/schedule-rotation`, data, { headers: adminHeader(adminToken) })
export const cancelRotation         = async (adminToken) => api.post(`/admin/lottery/cancel-rotation`, {}, { headers: adminHeader(adminToken) })
