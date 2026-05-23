import axios from 'axios'

// In Vite development, VITE_API_URL=/api uses the proxy in vite.config.js.
// The localhost fallback keeps direct backend access compatible.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

const RUTAS_SIN_REFRESH = [
  '/accounts/login/',
  '/token/',
  '/token/refresh/',
  '/accounts/login/refresh/',
]

function obtenerRutaApi(url = '') {
  try {
    return new URL(String(url), 'http://medistock.local').pathname.replace(/^\/api(?=\/)/, '')
  } catch {
    return String(url).split('?')[0].replace(/^\/api(?=\/)/, '')
  }
}

function esRutaSinRefresh(url) {
  const ruta = obtenerRutaApi(url)
  return RUTAS_SIN_REFRESH.some((rutaExcluida) =>
    ruta === rutaExcluida || ruta.endsWith(rutaExcluida)
  )
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token && !esRutaSinRefresh(config.url)) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {}
    const refresh = localStorage.getItem('refresh_token')
    const puedeIntentarRefresh =
      error.response?.status === 401 &&
      !original._retry &&
      Boolean(refresh) &&
      !esRutaSinRefresh(original.url)

    if (puedeIntentarRefresh) {
      original._retry = true
      try {
        const { data } = await axios.post(`${API_URL}/token/refresh/`, { refresh })
        localStorage.setItem('access_token', data.access)
        if (data.refresh) localStorage.setItem('refresh_token', data.refresh)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        localStorage.clear()
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  },
)

const esDesarrollo = import.meta.env.DEV

function respuestaDemo(data) {
  return Promise.resolve({ data, demo: true })
}

let demoAprobacionesB2B = [
  {
    id: 1,
    pedido: 1024,
    cliente_institucion: 'Clinica Baviera',
    cliente_username: 'clinica_baviera',
    pedido_tipo_cliente: 'institucional',
    pedido_total: 189900,
    ejecutivo_username: 'ejecutivo_ventas',
    fecha_revision: '2026-05-20T10:30:00Z',
    estado_aprobacion: 'pendiente',
    comentario: 'Demo: bandeja pendiente de endpoint dedicado.',
  },
]

let demoConciliacionesPago = [
  {
    id: 1,
    pago: 501,
    pago_monto: 84990,
    pago_estado: 'CONFIRMADO',
    pago_metodo: 'WEBPAY',
    analista_username: 'analista_finanzas',
    fecha_conciliacion: null,
    estado_conciliacion: 'pendiente',
    observacion: 'Demo: conciliacion financiera sin persistencia backend.',
    creado_en: '2026-05-20T12:00:00Z',
    actualizado_en: '2026-05-20T12:00:00Z',
  },
]

let demoGuiasDespacho = [
  {
    id: 1,
    numero_guia: 'GD-DEMO-0001',
    pedido: 1024,
    pedido_numero: 1024,
    despacho_tracking: 'DEMO-1024',
    fecha_emision: '2026-05-20T13:00:00Z',
    motivo_traslado: 'Venta online',
    transportista: 'Chilexpress demo',
    patente_vehiculo: 'MEDI-01',
    direccion_origen: 'Sucursal Central',
    direccion_destino: 'Direccion de entrega demo',
    estado: 'emitida',
    observacion: 'Demo documental; no genera guia backend.',
  },
]

const DEMO_PROVEEDORES = [
  {
    id: 1,
    nombre_empresa: 'Proveedor Clinico Demo SpA',
    rut: '76.000.000-0',
    contacto: 'Mesa de abastecimiento',
    email: 'compras.demo@medistock.cl',
    telefono: '+56 2 2000 0000',
    activo: true,
  },
]

const DEMO_ORDENES_COMPRA = [
  {
    id: 3001,
    proveedor_nombre: 'Proveedor Clinico Demo SpA',
    sucursal_nombre: 'Sucursal Central',
    usuario_username: 'operador_logistica',
    fecha_compra: '2026-05-19T09:00:00Z',
    estado: 'demo',
    estado_display: 'Demo',
    observacion: 'Orden de compra ilustrativa hasta exponer procurement en API.',
  },
]

const DEMO_INTEGRACIONES = [
  {
    id: 1,
    nombre: 'Chilexpress',
    tipo: 'courier',
    descripcion: 'Integracion real usada por cotizacion y tracking cuando hay datos.',
    endpoint_base: '/api/logistics/',
    activo: true,
    creado_en: '2026-05-18T08:00:00Z',
  },
  {
    id: 2,
    nombre: 'Transbank Webpay Plus',
    tipo: 'pago',
    descripcion: 'Integracion real usada para iniciar y confirmar pagos Webpay.',
    endpoint_base: '/api/payments/webpay/',
    activo: true,
    creado_en: '2026-05-18T08:05:00Z',
  },
]

const DEMO_REGISTROS_INTEGRACION = [
  {
    id: 1,
    integracion_nombre: 'Transbank Webpay Plus',
    usuario_username: 'paciente_gomez',
    entidad_relacionada_tipo: 'Pedido',
    entidad_relacionada_id: 1024,
    metodo: 'POST',
    endpoint: '/api/payments/webpay/iniciar/',
    estado: 'exitoso',
    codigo_respuesta: 201,
    mensaje: 'Demo de registro tecnico; no persistido en backend.',
    creado_en: '2026-05-20T14:00:00Z',
  },
]

const DEMO_AUDITORIA = [
  {
    id: 1,
    usuario_username: 'admin',
    modulo: 'integraciones',
    accion: 'revision_demo',
    descripcion: 'Evento demo para explicar auditoria futura.',
    entidad_tipo: 'IntegracionExterna',
    entidad_id: 1,
    nivel: 'info',
    creado_en: '2026-05-20T14:05:00Z',
  },
]

const DEMO_CONVENIOS = [
  {
    id: 1,
    institucion_nombre: 'Clinica Baviera',
    institucion_rut: '76.123.456-7',
    nombre_convenio: 'Convenio B2B demo',
    fecha_inicio: '2026-01-01',
    fecha_fin: '2026-12-31',
    porcentaje_descuento: 10,
    condiciones_pago: 'Webpay o transferencia institucional',
    estado: 'activo',
    observacion: 'Demo hasta exponer convenio institucional por API.',
  },
]

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
export const obtenerConveniosInstitucionales = () => respuestaDemo(DEMO_CONVENIOS)

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
export const obtenerProveedores = () => respuestaDemo(DEMO_PROVEEDORES)
export const obtenerOrdenesCompra = () => respuestaDemo(DEMO_ORDENES_COMPRA)

// --- Traslados de inventario ---
export const obtenerTrasladosInventario = () => api.get('/inventory/traslados/')
// Demo controlado: el backend lista traslados, pero no tiene acciones especificas para estados.
export const marcarTrasladoEnTransito = (id) => respuestaDemo({ id, estado: 'EN_TRANSITO' })
export const marcarTrasladoRecibido = (id) => respuestaDemo({ id, estado: 'RECIBIDO' })
export const cancelarTrasladoInventario = (id) => respuestaDemo({ id, estado: 'CANCELADO' })

// --- Integraciones y auditoria ---
// Demo controlado: integrations tiene modelos, pero aun no expone URLs en backend.
export const obtenerIntegracionesExternas = () => respuestaDemo(DEMO_INTEGRACIONES)
export const obtenerRegistrosIntegracion = () => respuestaDemo(DEMO_REGISTROS_INTEGRACION)
export const obtenerAuditoriaEventos = () => respuestaDemo(DEMO_AUDITORIA)

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
export const obtenerAprobacionesB2B = () => respuestaDemo(demoAprobacionesB2B)
export const aprobarRevisionB2B = (id) => {
  demoAprobacionesB2B = demoAprobacionesB2B.map(item =>
    Number(item.id) === Number(id) ? { ...item, estado_aprobacion: 'aprobado' } : item
  )
  return respuestaDemo({ id, estado_aprobacion: 'aprobado' })
}
export const rechazarRevisionB2B = (id) => {
  demoAprobacionesB2B = demoAprobacionesB2B.map(item =>
    Number(item.id) === Number(id) ? { ...item, estado_aprobacion: 'rechazado' } : item
  )
  return respuestaDemo({ id, estado_aprobacion: 'rechazado' })
}
export const observarRevisionB2B = (id) => {
  demoAprobacionesB2B = demoAprobacionesB2B.map(item =>
    Number(item.id) === Number(id) ? { ...item, estado_aprobacion: 'observado' } : item
  )
  return respuestaDemo({ id, estado_aprobacion: 'observado' })
}

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
export const obtenerConciliacionesPago = () => respuestaDemo(demoConciliacionesPago)
export const actualizarConciliacionPago = (id, datos) => {
  demoConciliacionesPago = demoConciliacionesPago.map(item =>
    Number(item.id) === Number(id)
      ? { ...item, ...datos, actualizado_en: new Date().toISOString() }
      : item
  )
  return respuestaDemo({ id, ...datos })
}

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
export const obtenerGuiasDespacho = () => respuestaDemo(demoGuiasDespacho)
export const marcarGuiaEnTransito = (id) => {
  demoGuiasDespacho = demoGuiasDespacho.map(item =>
    Number(item.id) === Number(id) ? { ...item, estado: 'en_transito' } : item
  )
  return respuestaDemo({ id, estado: 'en_transito' })
}
export const marcarGuiaEntregada = (id) => {
  demoGuiasDespacho = demoGuiasDespacho.map(item =>
    Number(item.id) === Number(id) ? { ...item, estado: 'entregada' } : item
  )
  return respuestaDemo({ id, estado: 'entregada' })
}
export const anularGuiaDespacho = (id) => {
  demoGuiasDespacho = demoGuiasDespacho.map(item =>
    Number(item.id) === Number(id) ? { ...item, estado: 'anulada' } : item
  )
  return respuestaDemo({ id, estado: 'anulada' })
}

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
