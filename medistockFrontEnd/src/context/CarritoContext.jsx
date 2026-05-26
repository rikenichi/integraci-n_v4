import { createContext, useContext, useState, useEffect } from 'react'
import { puedeComprar, razonNoCompra } from '../utils/permisos'
import { useToast } from './ToastContext'
import { obtenerPrecioProducto } from '../utils/format'

const CarritoContext = createContext(null)

function rolUsuarioActual() {
  try {
    const usuarioRaw = localStorage.getItem('usuario')
    if (!usuarioRaw) return null
    return JSON.parse(usuarioRaw)?.rol || null
  } catch {
    return null
  }
}

// IVA Chile 19%, ya incluido en el precio del producto.
// El costo de despacho se cotiza dinámicamente con Chilexpress en el checkout
// (ConfirmacionPedidoPage), ya que depende de la comuna y el peso del pedido.
// El carrito muestra "se calcula al confirmar" en vez de un monto fijo.
export const IVA = 0.19

export function CarritoProvider({ children }) {
  const { mostrarToast } = useToast()
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem('carrito')
    return stored ? JSON.parse(stored) : []
  })

  const [tipoDespacho, setTipoDespachoEstado] = useState(() => {
    return localStorage.getItem('carrito_tipo_despacho') || 'domicilio'
  })

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items))
  }, [items])

  useEffect(() => {
    localStorage.setItem('carrito_tipo_despacho', tipoDespacho)
  }, [tipoDespacho])

  const setTipoDespacho = (valor) => {
    if (valor === 'domicilio' || valor === 'retiro') setTipoDespachoEstado(valor)
  }

  const agregarItem = (producto, cantidad = 1) => {
    // Defensa central #1: solo roles autorizados pueden comprar.
    const rol = rolUsuarioActual()
    if (rol && !puedeComprar(rol)) {
      console.warn(`No se agregó al carrito — el rol "${rol}" no tiene permitido comprar.`)
      mostrarToast(razonNoCompra(rol), 'error')
      return false
    }

    // Defensa central #2: nunca permitir productos sin stock en el carrito.
    const stockDisponible = Number(producto?.stock_disponible ?? producto?.stock ?? 0)
    if (stockDisponible <= 0) {
      console.warn(`No se agregó al carrito "${producto?.nombre}" — stock agotado.`)
      mostrarToast(`"${producto?.nombre || 'Producto'}" está agotado`, 'error')
      return false
    }

    setItems(prev => {
      const existe = prev.find(i => i.producto.id === producto.id)
      // No exceder el stock disponible al sumar
      const cantidadActual = existe ? existe.cantidad : 0
      const cantidadFinal = Math.min(cantidadActual + cantidad, stockDisponible)
      if (existe) {
        return prev.map(i =>
          i.producto.id === producto.id ? { ...i, cantidad: cantidadFinal } : i
        )
      }
      return [...prev, { producto, cantidad: Math.min(cantidad, stockDisponible) }]
    })
    mostrarToast('Producto agregado al carrito', 'success')
    return true
  }

  const quitarItem = (productoId) => {
    setItems(prev => prev.filter(i => i.producto.id !== productoId))
  }

  const actualizarCantidad = (productoId, cantidad) => {
    if (cantidad <= 0) {
      quitarItem(productoId)
      return
    }
    setItems(prev => prev.map(i =>
      i.producto.id === productoId ? { ...i, cantidad } : i
    ))
  }

  const vaciarCarrito = () => setItems([])

  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0)

  // Subtotal con IVA incluido (el precio del backend ya viene con IVA)
  const calcularTotal = (esB2B = false) =>
    items.reduce((acc, i) => {
      const precio = obtenerPrecioProducto(i.producto, esB2B)
      return acc + parseFloat(precio || 0) * i.cantidad
    }, 0)

  /**
   * Desglose tributario a partir del subtotal con IVA.
   *
   * - subtotal:           suma de precios (con IVA incluido)
   * - descuento:          10% institucional, opcional
   * - baseAfectaIva:      subtotal − descuento (el envío no agrega IVA en este modelo)
   * - neto:               baseAfectaIva / 1.19
   * - iva:                baseAfectaIva − neto
   * - total:              baseAfectaIva (sin incluir despacho; este se cotiza en el checkout)
   *
   * IMPORTANTE: el costo de despacho NO se calcula acá. Depende de comuna y
   * peso, y se cotiza con Chilexpress en ConfirmacionPedidoPage.
   */
  const calcularResumen = ({ esB2B = false } = {}) => {
    const subtotal = calcularTotal(esB2B)
    const descuento = esB2B ? Math.round(subtotal * 0.10) : 0
    const baseAfectaIva = subtotal - descuento
    const neto = Math.round(baseAfectaIva / (1 + IVA))
    const iva = baseAfectaIva - neto
    const total = baseAfectaIva
    return { subtotal, descuento, baseAfectaIva, neto, iva, total }
  }

  return (
    <CarritoContext.Provider value={{
      items, agregarItem, quitarItem, actualizarCantidad,
      vaciarCarrito, totalItems, calcularTotal, calcularResumen,
      tipoDespacho, setTipoDespacho,
    }}>
      {children}
    </CarritoContext.Provider>
  )
}

export const useCarrito = () => useContext(CarritoContext)
