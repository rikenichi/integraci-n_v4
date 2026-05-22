import { useNavigate } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import { useAuth } from '../context/AuthContext'
import './CarritoPage.css'

function formatPrecio(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n)
}

export default function CarritoPage() {
  const { items, quitarItem, actualizarCantidad, vaciarCarrito, calcularTotal } = useCarrito()
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const esB2B = usuario?.rol === 'cliente_b2b' || usuario?.rol === 'ejecutivo'

  const subtotal = calcularTotal(esB2B)
  const descuento = esB2B ? subtotal * 0.10 : 0
  const total = subtotal - descuento

  if (items.length === 0) {
    return (
      <div className="page-container text-center">
        <div style={{padding: '60px 0'}}>
          <div style={{fontSize:'4rem'}}>🛒</div>
          <h2 style={{marginTop:16, marginBottom:8}}>Tu carrito está vacío</h2>
          <p className="text-muted">Agrega productos desde el catálogo.</p>
          <button className="btn btn-primary mt-2" onClick={() => navigate('/catalogo')}>
            Ir al catálogo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="flex-between">
        <h1 className="page-title">Carrito de Compras</h1>
        <button className="btn btn-secondary btn-sm" onClick={vaciarCarrito}>Vaciar carrito</button>
      </div>

      <div className="carrito-layout">
        <div className="carrito-items">
          {items.map(({ producto, cantidad }) => {
            const precio = esB2B ? producto.precio_b2b : producto.precio_b2c
            return (
              <div key={producto.id} className="item-row card">
                <div className="item-icon">🏥</div>
                <div className="item-info">
                  <p className="item-nombre">{producto.nombre}</p>
                  <p className="text-muted" style={{fontSize:'0.8rem'}}>{producto.codigo}</p>
                  <p className="item-precio">{formatPrecio(precio)} / {producto.unidad_medida}</p>
                </div>
                <div className="item-cantidad">
                  <button className="btn btn-secondary btn-sm"
                    onClick={() => actualizarCantidad(producto.id, cantidad - 1)}>−</button>
                  <span>{cantidad}</span>
                  <button className="btn btn-secondary btn-sm"
                    onClick={() => actualizarCantidad(producto.id, cantidad + 1)}>+</button>
                </div>
                <div className="item-subtotal">
                  {formatPrecio(parseFloat(precio) * cantidad)}
                </div>
                <button className="btn btn-danger btn-sm"
                  onClick={() => quitarItem(producto.id)}>✕</button>
              </div>
            )
          })}
        </div>

        <div className="carrito-resumen card">
          <h3 className="section-title">Resumen del pedido</h3>
          <div className="resumen-linea">
            <span>Subtotal ({items.length} producto{items.length > 1 ? 's' : ''})</span>
            <span>{formatPrecio(subtotal)}</span>
          </div>
          {esB2B && (
            <div className="resumen-linea resumen-descuento">
              <span>Descuento institucional (10%)</span>
              <span>− {formatPrecio(descuento)}</span>
            </div>
          )}
          <hr className="divider" />
          <div className="resumen-total">
            <span>Total</span>
            <span>{formatPrecio(total)}</span>
          </div>
          {esB2B && (
            <p className="text-muted mt-1" style={{fontSize:'0.8rem'}}>
              Precio B2B institucional con descuento aplicado al facturar.
            </p>
          )}
          <button
            className="btn btn-primary btn-block btn-lg mt-2"
            onClick={() => navigate('/confirmar-pedido')}
          >
            Confirmar pedido →
          </button>
        </div>
      </div>
    </div>
  )
}
