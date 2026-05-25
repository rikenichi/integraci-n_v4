import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatPrecio } from '../utils/format'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import './CartPage.css'

export default function CartPage() {
  const { items, actualizarCantidad, quitar, vaciar, subtotal, totalItems } = useCart()
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const ir = () => navigate(usuario ? '/checkout' : '/login?redirect=/checkout')

  if (items.length === 0) {
    return (
      <div className="page container">
        <EmptyState
          icon="🛒"
          titulo="Tu carrito está vacío"
          descripcion="Explora nuestro catálogo y agrega productos para comenzar tu pedido."
          accion={<Link to="/catalogo" className="btn btn-primary">Ir al catálogo</Link>}
        />
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Tu carrito</h1>
            <p className="text-muted">
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'} listos para finalizar.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={vaciar}>Vaciar carrito</Button>
        </div>

        <div className="cart-layout">
          <div className="cart-items card">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img">
                  {item.imagen ? (
                    <img src={item.imagen} alt={item.nombre} />
                  ) : (
                    <span>{item.nombre.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div className="cart-item-info">
                  <Link to={`/producto/${item.codigo}`} className="cart-item-title">
                    {item.nombre}
                  </Link>
                  <small className="text-muted">Cód. {item.codigo}</small>
                </div>

                <div className="cart-item-cantidad">
                  <button
                    type="button"
                    aria-label="Disminuir"
                    onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                  >
                    −
                  </button>
                  <span>{item.cantidad}</span>
                  <button
                    type="button"
                    aria-label="Aumentar"
                    onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-precio">
                  <strong>{formatPrecio(item.precio * item.cantidad)}</strong>
                  <small className="text-muted">{formatPrecio(item.precio)} c/u</small>
                </div>

                <button
                  className="cart-item-quitar"
                  onClick={() => quitar(item.id)}
                  aria-label="Quitar del carrito"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          <aside className="cart-summary card">
            <h3>Resumen</h3>
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <strong>{formatPrecio(subtotal)}</strong>
            </div>
            <div className="cart-summary-row">
              <span>Despacho</span>
              <small className="text-muted">Calculado en el siguiente paso</small>
            </div>
            <div className="divider" />
            <div className="cart-summary-row total">
              <span>Total estimado</span>
              <strong>{formatPrecio(subtotal)}</strong>
            </div>

            <Button variant="primary" size="lg" block onClick={ir} className="mt-2">
              {usuario ? 'Continuar al checkout' : 'Iniciar sesión para comprar'}
            </Button>

            <Link to="/catalogo" className="btn btn-link mt-2" style={{ display: 'block', textAlign: 'center' }}>
              ← Seguir comprando
            </Link>

            <div className="cart-trust">
              <p>🔒 Pago seguro con <strong>Webpay Plus</strong></p>
              <p>📦 Pedido procesado por <strong>MEDISTOCK</strong></p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
