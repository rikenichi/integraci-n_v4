/**
 * Política central de permisos por rol.
 *
 * Centralizar acá evita repartir las matrices de roles por cada página/componente
 * y asegura que la regla "quién puede hacer qué" sea única.
 */

// Roles que pueden agregar productos al carrito y completar una compra.
// Clientes (B2B/B2C/genérico), administradores y ejecutivos comerciales.
// Excluye explícitamente: analista (finanzas), operador (logística), trabajador genérico.
const ROLES_PUEDEN_COMPRAR = new Set([
  'cliente',
  'cliente_b2b',
  'cliente_b2c',
  'admin',
  'ejecutivo',
])

export function puedeComprar(rol) {
  if (!rol) return true // visitantes sin sesión sí pueden navegar el carrito
  return ROLES_PUEDEN_COMPRAR.has(String(rol).toLowerCase())
}

/**
 * Devuelve un mensaje explicativo cuando un rol no puede comprar,
 * útil para mostrar en tooltips o alerts.
 */
export function razonNoCompra(rol) {
  const r = String(rol || '').toLowerCase()
  if (r === 'analista') return 'Como Analista de Finanzas no tienes funciones de compra. Tu rol es generar reportes y conciliar pagos.'
  if (r === 'operador') return 'Como Operador Logístico no tienes funciones de compra. Tu rol es gestionar inventario y despachos.'
  if (r === 'trabajador') return 'Tu rol no tiene permitido realizar compras.'
  return 'Tu rol no tiene permitido realizar compras.'
}
