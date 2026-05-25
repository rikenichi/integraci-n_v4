import { createContext, useContext, useState, useEffect } from 'react'

const CarritoContext = createContext(null)

// IVA Chile 19%, ya incluido en precio. Costo flat para despacho a domicilio.
export const IVA = 0.19
export const COSTO_DESPACHO_DOMICILIO = 3000

export function CarritoProvider({ children }) {
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
    // Defensa central: nunca permitir productos sin stock en el carrito.
    const stockDisponible = Number(producto?.stock_disponible ?? producto?.stock ?? 0)
    if (stockDisponible <= 0) {
      console.warn(`No se agregó al carrito "${producto?.nombre}" — stock agotado.`)
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
      const precio = esB2B ? i.producto.precio_b2b : i.producto.precio_b2c
      return acc + parseFloat(precio || 0) * i.cantidad
    }, 0)

  /**
   * Desglose tributario y de despacho a partir del subtotal con IVA.
   *
   * - subtotal:           suma de precios (con IVA incluido)
   * - descuento:          10% institucional, opcional
   * - despacho:           $3.000 si domicilio, 0 si retiro
   * - baseAfectaIva:      subtotal − descuento (el envío no agrega IVA en este modelo)
   * - neto:               baseAfectaIva / 1.19
   * - iva:                baseAfectaIva − neto
   * - total:              baseAfectaIva + despacho
   */
  const calcularResumen = ({ esB2B = false, tipoDespacho: td = tipoDespacho } = {}) => {
    const subtotal = calcularTotal(esB2B)
    const descuento = esB2B ? Math.round(subtotal * 0.10) : 0
    const baseAfectaIva = subtotal - descuento
    const neto = Math.round(baseAfectaIva / (1 + IVA))
    const iva = baseAfectaIva - neto
    const despacho = td === 'domicilio' ? COSTO_DESPACHO_DOMICILIO : 0
    const total = baseAfectaIva + despacho
    return { subtotal, descuento, baseAfectaIva, neto, iva, despacho, total }
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
