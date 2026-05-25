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

// Mapeo simple producto crudo del backend → forma uniforme para Cruz Amarilla.
export function normalizarProducto(item = {}) {
  const stock = (item.stock_por_sucursal || []).reduce(
    (total, s) => total + Number(s.stock_neto ?? s.disponible ?? 0),
    0,
  )
  return {
    id: item.id,
    codigo: item.codigo || item.sku || `PROD-${item.id}`,
    nombre: item.nombre || 'Producto sin nombre',
    descripcion: item.descripcion || '',
    precio: Number(item.precio_b2b ?? item.precio_b2c ?? item.valor_unitario ?? item.precio ?? 0),
    unidad: item.unidad_medida || 'unidad',
    categoria: item.categoria_nombre || (item.categorias && item.categorias[0]) || '',
    marca: item.marca_nombre || item.marca?.nombre || '',
    imagen: item.imagen_url || null,
    stock_total: stock,
    activo: item.activo !== false,
    requiere_receta: Boolean(item.requiere_receta),
  }
}
