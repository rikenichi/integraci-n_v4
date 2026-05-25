// Utilidades de formato compartidas en toda la app.

const formateadorCLP = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

export function formatPrecio(valor) {
  return formateadorCLP.format(Number(valor || 0))
}

export function formatFecha(valor) {
  if (!valor) return '-'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return '-'
  return fecha.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function capitalizar(texto) {
  if (!texto) return ''
  const limpio = String(texto).replace(/_/g, ' ').toLowerCase()
  return limpio.replace(/\b\w/g, (l) => l.toUpperCase())
}

export function truncar(texto, max = 80) {
  if (!texto) return ''
  return texto.length > max ? `${texto.slice(0, max - 1)}…` : texto
}

export function extraerLista(respuesta) {
  return respuesta?.results || respuesta || []
}

/**
 * Normaliza un producto crudo del backend MEDISTOCK a una forma uniforme.
 * Tolera dos formatos: catálogo (`stock_por_sucursal`, categoría como string)
 * y endpoint público individual (categoría / marca como objetos anidados).
 */
export function normalizarProducto(item = {}) {
  const stockPorSucursal = (item.stock_por_sucursal || []).map((s) => ({
    sucursal_id: s.sucursal_id,
    sucursal: s.sucursal_nombre || s.sucursal || `Sucursal ${s.sucursal_id || ''}`,
    ciudad: s.ciudad || '',
    disponible: Number(s.stock_neto ?? s.disponible ?? 0),
  }))
  const stockTotal = stockPorSucursal.reduce((acc, s) => acc + s.disponible, 0)

  // Categoría puede venir como string en catálogo, como [{ categoria: { nombre } }] en endpoint público
  let categoria = ''
  if (typeof item.categoria_nombre === 'string') categoria = item.categoria_nombre
  else if (Array.isArray(item.categorias) && item.categorias.length > 0) {
    const c = item.categorias[0]
    categoria = typeof c === 'string' ? c : c?.categoria?.nombre || c?.nombre || ''
  }

  // Marca puede venir como string (marca_nombre) o como objeto { nombre }
  const marca =
    item.marca_nombre || (typeof item.marca === 'string' ? item.marca : item.marca?.nombre) || ''

  return {
    id: item.id,
    codigo: item.codigo || item.sku || `PROD-${item.id}`,
    nombre: item.nombre || 'Producto sin nombre',
    descripcion: item.descripcion || '',
    precio: Number(item.precio_b2b ?? item.precio_b2c ?? item.valor_unitario ?? item.precio ?? 0),
    unidad: item.unidad_medida || 'unidad',
    categoria,
    marca,
    imagen: item.imagen_url || null,
    stock_por_sucursal: stockPorSucursal,
    stock_total: stockTotal,
    activo: item.activo !== false,
    requiere_receta: Boolean(item.requiere_receta),
  }
}

/**
 * Construye una URL `mailto:` para solicitar cotización del producto.
 */
export function urlCotizacion(producto) {
  const asunto = `Cotización: ${producto.nombre} (cód. ${producto.codigo})`
  const cuerpo =
    `Hola, me interesa solicitar una cotización del siguiente producto disponible en MEDISTOCK:\n\n` +
    `• Producto: ${producto.nombre}\n` +
    `• Código: ${producto.codigo}\n` +
    `• Precio referencial: ${formatPrecio(producto.precio)} por ${producto.unidad}\n\n` +
    `Cantidad estimada: \n` +
    `RUT / Institución: \n` +
    `Dirección de despacho: \n\n` +
    `Saludos.`
  return `mailto:b2b@cruzamarilla.cl?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`
}
