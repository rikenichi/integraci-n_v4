/**
 * Politica central de permisos por rol.
 *
 * Centralizar aca evita repartir las matrices de roles por cada pagina/componente
 * y asegura que la regla "quien puede hacer que" sea unica.
 */

export const MENSAJE_FLUJO_SOLO_CLIENTES =
  'El flujo de compra solo está disponible para clientes. Usa una cuenta cliente para realizar pedidos.'

// El backend solo permite crear direcciones y pedidos a perfiles cliente.
const ROLES_PUEDEN_COMPRAR = new Set([
  'cliente',
  'cliente_b2b',
  'cliente_b2c',
])

export function puedeComprar(rol) {
  if (!rol) return true // visitantes sin sesion pueden navegar; checkout esta protegido.
  return ROLES_PUEDEN_COMPRAR.has(String(rol).toLowerCase())
}

/**
 * Devuelve un mensaje explicativo cuando un rol no puede comprar,
 * util para mostrar en tooltips o alerts.
 */
export function razonNoCompra(rol) {
  const r = String(rol || '').toLowerCase()
  if (r === 'analista') return 'Como Analista de Finanzas no tienes funciones de compra. Tu rol es generar reportes y conciliar pagos.'
  if (r === 'operador') return 'Como Operador Logístico no tienes funciones de compra. Tu rol es gestionar inventario y despachos.'
  return MENSAJE_FLUJO_SOLO_CLIENTES
}
