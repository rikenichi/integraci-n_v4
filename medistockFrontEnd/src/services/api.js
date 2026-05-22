import axios from 'axios'

// In Vite development, VITE_API_URL=/api uses the proxy in vite.config.js.
// The localhost fallback keeps direct backend access compatible.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Adjunta el token JWT a cada petición automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Renueva el token si recibe 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        const { data } = await axios.post(`${API_URL}/token/refresh/`, { refresh })
        localStorage.setItem('access_token', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// --- Auth ---
export const login = (username, password) =>
  api.post('/accounts/login/', { username, password })

export const logout = (refresh) =>
  api.post('/accounts/logout/', { refresh })

export const getPerfil = () => api.get('/accounts/perfil/me/')
export const actualizarPerfil = (datos) =>
  api.patch('/accounts/perfil/me/', datos)
export const obtenerMisDirecciones = () => api.get('/accounts/mis-direcciones/')
export const registrarUsuario = (datos) =>
  api.post('/accounts/registro/cliente/', datos)

export const obtenerConveniosInstitucionales = () =>
  api.get('/usuarios/convenios/')

// --- Productos ---
export const getProductos = (params = {}) =>
  api.get('/inventory/catalogo/', { params })

export const getProducto = (codigo) =>
  api.get(`/inventory/public/productos/${codigo}/`)

export const getStockProducto = (codigo) =>
  api.get('/inventory/catalogo/', { params: { search: codigo } })

const esDesarrollo = import.meta.env.DEV

function obtenerListaRespuesta(data) {
  return data?.results || data || []
}

function normalizarProducto(item) {
  const stockPorSucursal = item.stock_por_sucursal || []
  const precio = item.valor_unitario ?? item.precio_b2c ?? item.precio_b2b ?? item.precio ?? 0

  return {
    ...item,
    id: item.id,
    codigo: item.codigo || item.sku || `PROD-${item.id}`,
    sku: item.sku || item.codigo || null,
    nombre: item.nombre || '',
    descripcion: item.descripcion || '',
    precio_b2c: item.precio_b2c ?? item.valor_unitario ?? item.precio ?? 0,
    precio_b2b: item.precio_b2b ?? item.valor_unitario ?? item.precio ?? 0,
    precio,
    unidad_medida: item.unidad_medida || 'unidad',
    categoria_nombre: item.categoria_nombre || item.categorias?.[0] || '',
    marca_nombre: item.marca_nombre || item.marca?.nombre || '',
    imagen_url: item.imagen_url || null,
    activo: item.activo !== false,
    stock_disponible: stockPorSucursal.reduce(
      (total, stock) => total + Number(stock.stock_neto ?? stock.disponible ?? 0),
      0,
    ),
  }
}

function filtrarProductosLocalmente(productos, params = {}) {
  const search = params.search?.trim().toLowerCase()
  return productos.filter((producto) => {
    if (!search) return true
    return [producto.nombre, producto.codigo, producto.descripcion]
      .filter(Boolean)
      .some((valor) => valor.toLowerCase().includes(search))
  })
}

export async function obtenerProductosCompatibles(params = {}) {
  try {
    if (esDesarrollo) console.info('Usando endpoint actual /api/inventory/catalogo/')
    const response = await getProductos(params)
    return obtenerListaRespuesta(response.data).map(normalizarProducto)
  } catch (error) {
    if (esDesarrollo) console.info('Fallback a endpoint compatible /api/inventory/catalogo/')
    const compatParams = {}
    if (params.categoria) compatParams.categoria_id = params.categoria
    const response = await api.get('/inventory/catalogo/', { params: compatParams })
    const productos = obtenerListaRespuesta(response.data).map(normalizarProducto)
    return filtrarProductosLocalmente(productos, params)
  }
}

export async function obtenerProductoCompatible(codigo) {
  try {
    const response = await getProducto(codigo)
    return normalizarProducto(response.data)
  } catch {
    const productos = await obtenerProductosCompatibles()
    const producto = productos.find((item) =>
      String(item.codigo) === String(codigo) ||
      String(item.sku) === String(codigo) ||
      String(item.id) === String(codigo)
    )
    if (!producto) throw new Error('Producto no encontrado')
    return producto
  }
}

export async function obtenerStockProductoCompatible(codigo) {
  try {
    const response = await getStockProducto(codigo)
    const lista = obtenerListaRespuesta(response.data)
    const item = lista.find((producto) =>
      String(producto.codigo || producto.sku || producto.id) === String(codigo)
    )
    if (!item) return response.data
    return {
      producto: item.sku || item.codigo || `PROD-${item.id}`,
      stock_por_sucursal: (item.stock_por_sucursal || []).map((stock) => ({
        sucursal_id: stock.sucursal_id,
        sucursal: stock.sucursal_nombre,
        ciudad: stock.ciudad || '-',
        disponible: Number(stock.stock_neto ?? stock.disponible ?? 0),
      })),
    }
  } catch {
    const response = await api.get('/inventory/catalogo/')
    const item = obtenerListaRespuesta(response.data).find((producto) =>
      String(producto.codigo || producto.sku || producto.id) === String(codigo)
    )
    if (!item) throw new Error('Stock no encontrado')
    return {
      producto: item.sku || item.codigo || `PROD-${item.id}`,
      stock_por_sucursal: (item.stock_por_sucursal || []).map((stock) => ({
        sucursal_id: stock.sucursal_id,
        sucursal: stock.sucursal_nombre,
        ciudad: stock.ciudad || '-',
        disponible: Number(stock.stock_neto ?? stock.disponible ?? 0),
      })),
    }
  }
}

export const obtenerResumenInventario = () =>
  api.get('/stock/resumen-inventario/')

// --- Compras internas ---
export const obtenerProveedores = () => api.get('/compras/proveedores/')
export const obtenerOrdenesCompra = () => api.get('/compras/ordenes/')

// --- Traslados de inventario ---
export const obtenerTrasladosInventario = () => api.get('/stock/traslados/')
export const marcarTrasladoEnTransito = (id) => api.post(`/stock/traslados/${id}/marcar-en-transito/`)
export const marcarTrasladoRecibido = (id) => api.post(`/stock/traslados/${id}/marcar-recibido/`)
export const cancelarTrasladoInventario = (id) => api.post(`/stock/traslados/${id}/cancelar/`)

// --- Integraciones y auditoría ---
export const obtenerIntegracionesExternas = () => api.get('/integraciones/integraciones/')
export const obtenerRegistrosIntegracion = () => api.get('/integraciones/registros/')
export const obtenerAuditoriaEventos = () => api.get('/integraciones/auditoria/')

// --- Categorías ---
export const getCategorias = () => api.get('/inventory/public/categorias/')

// --- Pedidos ---
export const crearPedido = (datos) => api.post('/orders/pedidos/', datos)
export const getMisPedidos = () => api.get('/orders/pedidos/mis-pedidos/')
export const getPedidosTodos = () => api.get('/orders/pedidos/todos/')
export const getPedido = (id) => api.get(`/orders/pedidos/${id}/`)
export const obtenerPedidoDetalle = getPedido
export const aprobarPedido = (id) => api.post(`/orders/pedidos/${id}/aprobar/`)
export const obtenerAprobacionesB2B = () => api.get('/pedidos/aprobaciones/')
export const aprobarRevisionB2B = (id) => api.post(`/pedidos/aprobaciones/${id}/aprobar/`)
export const rechazarRevisionB2B = (id) => api.post(`/pedidos/aprobaciones/${id}/rechazar/`)
export const observarRevisionB2B = (id) => api.post(`/pedidos/aprobaciones/${id}/observar/`)

// --- Pagos ---
export const simularPago = (datos) => api.post('/pagos/simular/', datos)
export const getPagos = () => api.get('/payments/mis-pagos/')
export const obtenerConciliacionesPago = () => api.get('/pagos/conciliaciones/')
export const actualizarConciliacionPago = (id, datos) =>
  api.patch(`/pagos/conciliaciones/${id}/`, datos)

// --- DTE simulado ---
export const obtenerDocumentosTributarios = () => api.get('/dte/documentos/')
export const obtenerDocumentoTributarioDetalle = (id) => api.get(`/dte/documentos/${id}/`)
export const generarDteDesdePedido = (pedidoId) =>
  api.post(`/dte/documentos/generar-desde-pedido/${pedidoId}/`)

// --- WebPay Plus (Transbank, ambiente TEST) ---
// Inicia transacción real: devuelve { redirect_url } para redirigir a Transbank
export const iniciarWebpay = (pedidoId) =>
  api.post('/payments/webpay/iniciar/', { pedido_id: pedidoId })
export const confirmarWebpay = (token) =>
  api.get('/payments/webpay/commit/', { params: { token_ws: token } })
export const obtenerEstadoWebpay = (token) =>
  api.get(`/payments/webpay/estado/${token}/`)

// --- Despachos ---
export const generarTracking = (pedidoId) =>
  api.post('/logistics/envios/', { pedido_id: pedidoId })

export const getDespacho = (id) => api.get(`/logistics/despachos/${id}/`)
export const getTracking = (pedidoId) => api.get(`/logistics/envios/${pedidoId}/tracking/`)
export const getDespachos = () => api.get('/logistics/despachos/')
export const obtenerGuiasDespacho = () => api.get('/logistics/guias/')
export const marcarGuiaEnTransito = (id) => api.post(`/logistics/guias/${id}/marcar-en-transito/`)
export const marcarGuiaEntregada = (id) => api.post(`/logistics/guias/${id}/marcar-entregada/`)
export const anularGuiaDespacho = (id) => api.post(`/logistics/guias/${id}/anular/`)

// --- Courier experimental ---
// Cotiza el costo de envío sin crear ningún despacho.
// pedido_id es opcional; si no existe aún, omitirlo.
export const getRegionesCourier = () => api.get('/locations/regions/')
export const getComunasCourier = (region) =>
  api.get('/locations/comunas/', { params: { region_id: region } })
export const obtenerRegionesDespacho = getRegionesCourier
export const obtenerComunasDespacho = (regionId) =>
    api.get('/locations/comunas/', {
      params: { region_id: regionId },
    })
export const cotizarDespacho = (payload) => api.post('/logistics/cotizar/', payload)
// Genera una guía de despacho vía courier externo (requiere rol operador/admin).
export const generarCourier = (pedidoId, courier = 'mock') =>
  api.post('/logistics/envios/', { pedido_id: pedidoId, courier })
export const getCourierTracking = (numeroTracking) =>
  api.get(`/logistics/courier-tracking/${numeroTracking}/`)
export const obtenerSucursalDespacho = (sucursalId) =>
    api.get(`/locations/sucursales/${sucursalId}/`)
export const crearDireccionEntrega = (payload) => api.post('/accounts/mis-direcciones/', payload)
export default api
