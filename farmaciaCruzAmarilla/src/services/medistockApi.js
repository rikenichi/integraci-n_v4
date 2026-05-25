import axios from 'axios'

// Cliente axios apuntando al backend de MEDISTOCK.
// En dev VITE_MEDISTOCK_API=/api → Vite proxy → http://localhost:8000
// En prod, definir VITE_MEDISTOCK_API=https://api-medistock-en-aws.cl/api
const BASE = import.meta.env.VITE_MEDISTOCK_API || '/api'

const ACCESS_KEY = 'cruzamarilla_access'
const REFRESH_KEY = 'cruzamarilla_refresh'

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setTokens: (access, refresh) => {
    if (access) localStorage.setItem(ACCESS_KEY, access)
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
})

const RUTAS_SIN_AUTH = ['/accounts/login/', '/accounts/login/refresh/']

function esRutaSinAuth(url = '') {
  return RUTAS_SIN_AUTH.some(r => url.endsWith(r))
}

api.interceptors.request.use(config => {
  const token = tokenStorage.getAccess()
  if (token && !esRutaSinAuth(config.url)) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config || {}
    const refresh = tokenStorage.getRefresh()
    const puedeRefrescar =
      error.response?.status === 401 &&
      !original._retry &&
      refresh &&
      !esRutaSinAuth(original.url)

    if (puedeRefrescar) {
      original._retry = true
      try {
        const { data } = await axios.post(`${BASE}/accounts/login/refresh/`, { refresh })
        tokenStorage.setTokens(data.access, data.refresh)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        tokenStorage.clear()
      }
    }
    return Promise.reject(error)
  },
)

// ============================================================
// CATÁLOGO PÚBLICO (sin auth)
// ============================================================
export const obtenerCatalogo = () => api.get('/inventory/catalogo/')
export const obtenerCategorias = () => api.get('/inventory/public/categorias/')
export const obtenerProductoPublico = (codigo) =>
  api.get(`/inventory/public/productos/${codigo}/`)

// ============================================================
// AUTENTICACIÓN
// ============================================================
export const login = (username, password) =>
  api.post('/accounts/login/', { username, password })
export const obtenerPerfil = () => api.get('/accounts/perfil/me/')
export const logout = (refresh) => api.post('/accounts/logout/', { refresh })

// ============================================================
// PEDIDOS
// ============================================================
export const crearPedido = (datos) => api.post('/orders/pedidos/', datos)
export const obtenerMisPedidos = () => api.get('/orders/pedidos/mis-pedidos/')
export const obtenerPedido = (id) => api.get(`/orders/pedidos/${id}/`)

// ============================================================
// PAGOS (Webpay vía MEDISTOCK)
// ============================================================
export const iniciarWebpay = (pedidoId) =>
  api.post('/payments/webpay/iniciar/', { pedido_id: pedidoId })

export default api
