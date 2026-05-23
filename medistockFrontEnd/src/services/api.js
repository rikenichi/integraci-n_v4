import axios from 'axios'

// In Vite development, VITE_API_URL=/api uses the proxy in vite.config.js.
// The localhost fallback keeps direct backend access compatible.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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
        if (data.refresh) localStorage.setItem('refresh_token', data.refresh)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

const esDesarrollo = import.meta.env.DEV

function respuestaDemo(data) {
  return Promise.resolve({ data, demo: true })
}

function obtenerListaRespuesta(data) {
  return data?.results || data || []
}

function formatearEstado(valor) {
  return String(valor || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, letra => letra.toUpperCase())
}

function normalizarDetallePedido(detalle = {}) {
  return {
    ...detalle,
    producto_codigo: detalle.producto_codigo || detalle.producto_sku || detalle.producto_info?.codigo || detalle.producto_id,
    producto_nombre: detalle.producto_nombre || detalle.producto_info?.nombre || `Producto ${detalle.producto_id || ''}`,
    precio_unitario: detalle.precio_unitario ?? detalle.precio_unitario_historico ?? 0,
    subtotal: detalle.subtotal ?? 0,
  }
}

function normalizarPedido(pedido = {}) {
  const estado = String(pedido.estado || pedido.estado_pedido || '').toLowerCase()
  const detalles = Array.isArray(pedido.detalles)
    ? pedido.detalles.map(normalizarDetallePedido)
    : []

  return {
    ...pedido,
    estado,
    estado_display: pedido.estado_display || formatearEstado(pedido.estado_pedido || pedido.estado),
    creado_en: pedido.creado_en || pedido.fecha_creacion,
    actualizado_en: pedido.actualizado_en || pedido.fecha_actualizacion,
    descuento: pedido.descuento ?? pedido.descuento_total ?? 0,
    costo_envio: pedido.costo_envio ?? pedido.despacho_info?.costo_despacho ?? 0,
    detalles,
  }
}

function normalizarRespuestaPedido(response) {
  return {
    ...response,
    data: Array.isArray(response.data)
      ? response.data.map(normalizarPedido)
      : normalizarPedido(response.data),
  }
}

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

// Demo controlado: accounts define convenios, pero aun no expone URL publica.
export const obtenerConveniosInstitucionales = () => respuestaDemo([])

// --- Productos ---
export const getProductos = (params = {}) =>
  api.get('/inventory/catalogo/', { params })

export const getProducto = (codigo) =>
  api.get(`/inventory/public/productos/${codigo}/`)

export const getStockProducto = () =>
  api.get('/inventory/catalogo/')

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
    return [producto.nombre, producto.codigo, producto.sku, producto.descripcion]
      .filter(Boolean)
      .some((valor) => valor.toLowerCase().includes(search))
  })
}

export async function obtenerProductosCompatibles(params = {}) {
  try {
    if (esDesarrollo) console.info('Usando endpoint real /api/inventory/catalogo/')
    const compatParams = {}
    if (params.categoria) compatParams.categoria_id = params.categoria
    const response = await getProductos(compatParams)
    const productos = obtenerListaRespuesta(response.data).map(normalizarProducto)
    return filtrarProductosLocalmente(productos, params)
  } catch {
    const response = await api.get('/inventory/catalogo/')
    const productos = obtenerListaRespuesta(response.data).map(normalizarProducto)
    return filtrarProductosLocalmente(productos, params)
  }
}

export async function obtenerProductoCompatible(codigo) {
  try {
    const response = await getProducto(codigo)
    const productoDetalle = normalizarProducto(response.data)
    if (productoDetalle.stock_por_sucursal?.length) return productoDetalle

    const productos = await obtenerProductosCompatibles()
    const productoCatalogo = productos.find((item) =>
      String(item.id) === String(productoDetalle.id) ||
      String(item.codigo) === String(codigo) ||
      String(item.sku) === String(codigo)
    )
    return productoCatalogo ? { ...productoDetalle, ...productoCatalogo } : productoDetalle
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
  const response = await getStockProducto()
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

function normalizarInventarioResumen(inventarios = [], lotes = [], movimientos = []) {
  const stockCritico = inventarios
    .map((item) => ({
      producto_id: item.lote?.producto?.id || item.lote?.producto_id,
      producto_codigo: item.lote?.producto?.sku || item.producto_codigo,
      producto_nombre: item.lote?.producto?.nombre || item.producto_nombre || 'Producto no informado',
      sucursal_nombre: item.sucursal_nombre || `Sucursal ${item.sucursal}`,
      cantidad: item.cantidad_disponible,
      cantidad_reservada: item.cantidad_reservada,
      disponible: item.stock_neto ?? Number(item.cantidad_disponible || 0) - Number(item.cantidad_reservada || 0),
      stock_minimo: item.stock_critico,
    }))
    .filter((item) => Number(item.disponible) <= Number(item.stock_minimo || 0))

  const hoy = new Date()
  const limite = new Date()
  limite.setDate(hoy.getDate() + 45)

  const lotesAlertados = lotes
    .filter((lote) => lote.fecha_vencimiento)
    .map((lote) => {
      const vence = new Date(`${lote.fecha_vencimiento}T00:00:00`)
      return {
        producto_nombre: lote.producto?.nombre || 'Producto no informado',
        codigo_lote: lote.codigo_lote,
        sucursal_nombre: '-',
        fecha_vencimiento: lote.fecha_vencimiento,
        cantidad_disponible: '-',
        estado_lote: vence < hoy ? 'vencido' : 'proximo_vencer',
        _vence: vence,
      }
    })
    .filter((lote) => lote._vence <= limite)
    .map(({ _vence, ...lote }) => lote)

  const movimientosRecientes = movimientos.slice(0, 10).map((movimiento) => ({
    creado_en: movimiento.fecha_movimiento,
    producto_nombre: movimiento.producto_nombre || movimiento.inventario_producto_nombre || '-',
    sucursal_nombre: movimiento.sucursal_nombre || '-',
    lote_codigo: movimiento.lote_codigo || '-',
    tipo_movimiento: movimiento.tipo_movimiento,
    cantidad: movimiento.cantidad,
    referencia: movimiento.pedido || movimiento.compra_proveedor || movimiento.traslado_inventario || '-',
    usuario: movimiento.usuario_nombre || movimiento.usuario || '-',
    motivo: movimiento.motivo,
  }))

  return {
    stock_critico: stockCritico,
    lotes_proximos_vencer: lotesAlertados,
    movimientos_recientes: movimientosRecientes,
  }
}

export async function obtenerResumenInventario() {
  const [inventariosR, lotesR, movimientosR] = await Promise.all([
    api.get('/inventory/inventarios/'),
    api.get('/inventory/lotes/'),
    api.get('/inventory/movimientos/'),
  ])

  return {
    data: normalizarInventarioResumen(
      obtenerListaRespuesta(inventariosR.data),
      obtenerListaRespuesta(lotesR.data),
      obtenerListaRespuesta(movimientosR.data),
    ),
  }
}

// --- Compras internas ---
// Demo controlado: procurement tiene modelos, pero aun no expone URLs en backend.
export const obtenerProveedores = () => respuestaDemo([])
export const obtenerOrdenesCompra = () => respuestaDemo([])

// --- Traslados de inventario ---
export const obtenerTrasladosInventario = () => api.get('/inventory/traslados/')
// Demo controlado: el backend lista traslados, pero no tiene acciones especificas para estados.
export const marcarTrasladoEnTransito = (id) => respuestaDemo({ id, estado: 'EN_TRANSITO' })
export const marcarTrasladoRecibido = (id) => respuestaDemo({ id, estado: 'RECIBIDO' })
export const cancelarTrasladoInventario = (id) => respuestaDemo({ id, estado: 'CANCELADO' })

// --- Integraciones y auditoria ---
// Demo controlado: integrations tiene modelos, pero aun no expone URLs en backend.
export const obtenerIntegracionesExternas = () => respuestaDemo([])
export const obtenerRegistrosIntegracion = () => respuestaDemo([])
export const obtenerAuditoriaEventos = () => respuestaDemo([])

// --- Categorias ---
export const getCategorias = () => api.get('/inventory/public/categorias/')

// --- Pedidos ---
export const crearPedido = (datos) => api.post('/orders/pedidos/', datos)
export const getMisPedidos = async () =>
  normalizarRespuestaPedido(await api.get('/orders/pedidos/mis-pedidos/'))
export const getPedidosTodos = async () =>
  normalizarRespuestaPedido(await api.get('/orders/pedidos/todos/'))
export const getPedido = async (id) =>
  normalizarRespuestaPedido(await api.get(`/orders/pedidos/${id}/`))
export const obtenerPedidoDetalle = getPedido
export const aprobarPedido = (id) => api.post(`/orders/pedidos/${id}/aprobar/`)
// Demo controlado: no existe endpoint separado para revisiones B2B.
export const obtenerAprobacionesB2B = () => respuestaDemo([])
export const aprobarRevisionB2B = (id) => respuestaDemo({ id, estado_aprobacion: 'aprobado' })
export const rechazarRevisionB2B = (id) => respuestaDemo({ id, estado_aprobacion: 'rechazado' })
export const observarRevisionB2B = (id) => respuestaDemo({ id, estado_aprobacion: 'observado' })

// --- Pagos ---
// Demo controlado: el backend real disponible para pagos es Webpay en /payments/.
export const simularPago = (datos) => {
  const numero = String(datos.numero_tarjeta || '').replace(/\s+/g, '')
  const aprobado = datos.metodo === 'transferencia' || !numero.endsWith('0000')
  return respuestaDemo({
    aprobado,
    pedido_id: datos.pedido_id,
    metodo: datos.metodo,
    metodo_display: datos.metodo === 'transferencia'
      ? 'Transferencia bancaria'
      : datos.metodo === 'tarjeta_debito'
        ? 'Tarjeta de debito'
        : 'Tarjeta de credito',
    monto: datos.monto || 0,
    estado_display: aprobado ? 'Aprobado demo' : 'Rechazado demo',
    codigo_transaccion: `DEMO-${Date.now()}`,
    motivo_rechazo: aprobado ? '' : 'Tarjeta demo terminada en 0000.',
  })
}
export const getPagos = () => api.get('/payments/mis-pagos/')
// Demo controlado: conciliacion financiera aun no tiene URL backend.
export const obtenerConciliacionesPago = () => respuestaDemo([])
export const actualizarConciliacionPago = (id, datos) =>
  respuestaDemo({ id, ...datos })

// --- DTE simulado ---
// Demo controlado: billing tiene modelos DTE, pero aun no expone URLs.
export const obtenerDocumentosTributarios = () => respuestaDemo([])
export const obtenerDocumentoTributarioDetalle = (id) => respuestaDemo({
  id,
  pedido: null,
  tipo_documento_nombre: 'DTE demo',
  folio: `DEMO-${id}`,
  fecha_emision: new Date().toISOString(),
  estado_dte: 'GENERADO_DEMO',
  monto_total: 0,
  detalles: [],
})
export const generarDteDesdePedido = (pedidoId) =>
  respuestaDemo({
    id: `demo-${pedidoId}`,
    pedido: pedidoId,
    tipo_documento_nombre: 'DTE demo',
    folio: `DEMO-${pedidoId}`,
    fecha_emision: new Date().toISOString(),
    estado_dte: 'GENERADO_DEMO',
    monto_total: 0,
  })

// --- WebPay Plus (Transbank, ambiente TEST) ---
export const iniciarWebpay = (pedidoId) =>
  api.post('/payments/webpay/iniciar/', { pedido_id: pedidoId })
export const confirmarWebpay = (token) =>
  api.get('/payments/webpay/commit/', { params: { token_ws: token } })
export const obtenerEstadoWebpay = (token) =>
  api.get(`/payments/webpay/estado/${token}/`)

// --- Despachos ---
export const generarTracking = (pedidoId) =>
  respuestaDemo({
    pedido: pedidoId,
    numero_tracking: `DEMO-${pedidoId}`,
    courier: 'Demo courier',
    estado: 'generado',
    fecha_estimada_entrega: null,
    direccion_destino: 'Direccion demo',
    eventos: [],
  })

// Demo controlado: no hay endpoint de listado/detalle de despachos montado.
export const getDespacho = (id) => respuestaDemo({ id })
export const getTracking = (pedidoId) => api.get(`/logistics/envios/${pedidoId}/tracking/`)
export const getDespachos = () => respuestaDemo([])
// Demo controlado: billing define GuiaDespacho, pero aun no expone URLs.
export const obtenerGuiasDespacho = () => respuestaDemo([])
export const marcarGuiaEnTransito = (id) => respuestaDemo({ id, estado: 'en_transito' })
export const marcarGuiaEntregada = (id) => respuestaDemo({ id, estado: 'entregada' })
export const anularGuiaDespacho = (id) => respuestaDemo({ id, estado: 'anulada' })

// --- Courier experimental ---
export const getRegionesCourier = () => api.get('/locations/regions/')
export const getComunasCourier = (region) =>
  api.get('/locations/comunas/', { params: { region_id: region } })
export const obtenerRegionesDespacho = getRegionesCourier
export const obtenerComunasDespacho = (regionId) =>
  api.get('/locations/comunas/', {
    params: { region_id: regionId },
  })
export const cotizarDespacho = (payload) => api.post('/logistics/cotizar/', payload)
export const generarCourier = (pedidoId, courier = 'mock') =>
  respuestaDemo({ pedido: pedidoId, courier, estado: 'generado' })
export const getCourierTracking = (numeroTracking) =>
  respuestaDemo({ numero_tracking: numeroTracking, eventos: [] })
export const obtenerSucursalDespacho = (sucursalId) =>
  api.get(`/locations/sucursales/${sucursalId}/`)
export const crearDireccionEntrega = (payload) => api.post('/accounts/mis-direcciones/', payload)

export default api
