import { createContext, useContext, useState, useEffect } from 'react'

const CarritoContext = createContext(null)

export function CarritoProvider({ children }) {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem('carrito')
    return stored ? JSON.parse(stored) : []
  })

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items))
  }, [items])

  const agregarItem = (producto, cantidad = 1) => {
    setItems(prev => {
      const existe = prev.find(i => i.producto.id === producto.id)
      if (existe) {
        return prev.map(i =>
          i.producto.id === producto.id
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i
        )
      }
      return [...prev, { producto, cantidad }]
    })
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

  const calcularTotal = (esB2B = false) =>
    items.reduce((acc, i) => {
      const precio = esB2B ? i.producto.precio_b2b : i.producto.precio_b2c
      return acc + parseFloat(precio) * i.cantidad
    }, 0)

  return (
    <CarritoContext.Provider value={{
      items, agregarItem, quitarItem, actualizarCantidad,
      vaciarCarrito, totalItems, calcularTotal,
    }}>
      {children}
    </CarritoContext.Provider>
  )
}

export const useCarrito = () => useContext(CarritoContext)
