import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'cruzamarilla_cart'

function leerStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => leerStorage())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const agregar = useCallback((producto, cantidad = 1) => {
    setItems((prev) => {
      const existente = prev.find((i) => i.id === producto.id)
      if (existente) {
        return prev.map((i) =>
          i.id === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i,
        )
      }
      return [
        ...prev,
        {
          id: producto.id,
          codigo: producto.codigo,
          nombre: producto.nombre,
          precio: producto.precio,
          unidad: producto.unidad,
          imagen: producto.imagen,
          cantidad,
        },
      ]
    })
  }, [])

  const actualizarCantidad = useCallback((id, cantidad) => {
    setItems((prev) => {
      if (cantidad <= 0) return prev.filter((i) => i.id !== id)
      return prev.map((i) => (i.id === id ? { ...i, cantidad } : i))
    })
  }, [])

  const quitar = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const vaciar = useCallback(() => setItems([]), [])

  const totales = useMemo(() => {
    const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0)
    const subtotal = items.reduce((acc, i) => acc + i.cantidad * Number(i.precio || 0), 0)
    return { totalItems, subtotal }
  }, [items])

  return (
    <CartContext.Provider
      value={{ items, agregar, actualizarCantidad, quitar, vaciar, ...totales }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
