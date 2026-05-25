import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { crearPedido } from '../services/medistockApi'
import { formatPrecio } from '../utils/format'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import './CheckoutPage.css'

export default function CheckoutPage() {
  const { items, subtotal, vaciar } = useCart()
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const [tipoDespacho, setTipoDespacho] = useState('domicilio')
  const [direccion, setDireccion] = useState('')
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  if (items.length === 0) {
    return (
      <div className="page container">
        <EmptyState
          icon="🛒"
          titulo="No hay nada en tu carrito"
          descripcion="Agrega productos antes de proceder al checkout."
          accion={<Link to="/catalogo" className="btn btn-primary">Ir al catálogo</Link>}
        />
      </div>
    )
  }

  const handleConfirmar = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const payload = {
        tipo_venta: usuario?.es_institucional ? 'INSTITUCIONAL' : 'PARTICULAR',
        tipo_despacho: tipoDespacho.toUpperCase(),
        observacion: comentario || `Pedido vía Farmacia Cruz Amarilla. ${direccion ? `Despacho: ${direccion}` : ''}`,
        detalles: items.map((i) => ({
          producto: i.id,
          cantidad: i.cantidad,
          precio_unitario: i.precio,
        })),
      }

      const { data } = await crearPedido(payload)
      vaciar()
      navigate(`/mis-pedidos?recien=${data?.id || ''}`)
    } catch (err) {
      console.error(err)
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'No pudimos crear tu pedido. Verifica los datos e intenta nuevamente.'
      setError(typeof msg === 'string' ? msg : 'No pudimos procesar tu pedido.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Confirmar pedido</h1>
            <p className="text-muted">
              Estás comprando como <strong>{usuario?.nombre || usuario?.username}</strong>
              {usuario?.es_institucional && ' · cuenta institucional'}.
            </p>
          </div>
          <Link to="/carrito" className="btn btn-ghost btn-sm">← Volver al carro</Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="checkout-grid" onSubmit={handleConfirmar}>
          <div className="card checkout-form">
            <h3>Datos de despacho</h3>

            <div className="checkout-radio-group">
              <label className={`checkout-radio ${tipoDespacho === 'domicilio' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="despacho"
                  value="domicilio"
                  checked={tipoDespacho === 'domicilio'}
                  onChange={(e) => setTipoDespacho(e.target.value)}
                />
                <div>
                  <strong>🚚 Envío a domicilio</strong>
                  <small>Despacho coordinado con Chilexpress</small>
                </div>
              </label>
              <label className={`checkout-radio ${tipoDespacho === 'retiro' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="despacho"
                  value="retiro"
                  checked={tipoDespacho === 'retiro'}
                  onChange={(e) => setTipoDespacho(e.target.value)}
                />
                <div>
                  <strong>🏪 Retiro en sucursal</strong>
                  <small>Av. Providencia 1234, Santiago</small>
                </div>
              </label>
            </div>

            {tipoDespacho === 'domicilio' && (
              <div className="field">
                <label>Dirección de despacho</label>
                <input
                  type="text"
                  placeholder="Av. Apoquindo 1234, Las Condes"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="field">
              <label>Comentarios (opcional)</label>
              <textarea
                rows={3}
                placeholder="Instrucciones especiales, número de orden de compra, etc."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
            </div>
          </div>

          <aside className="card checkout-resumen">
            <h3>Tu pedido</h3>
            <ul className="checkout-items">
              {items.map((i) => (
                <li key={i.id}>
                  <span>{i.cantidad} × {i.nombre}</span>
                  <strong>{formatPrecio(i.precio * i.cantidad)}</strong>
                </li>
              ))}
            </ul>
            <div className="divider" />
            <div className="checkout-total">
              <span>Total</span>
              <strong>{formatPrecio(subtotal)}</strong>
            </div>
            <small className="text-muted">El despacho se calcula al confirmar.</small>

            <Button variant="primary" size="lg" block loading={enviando} type="submit" className="mt-2">
              {enviando ? 'Procesando…' : 'Confirmar pedido'}
            </Button>

            <p className="checkout-disclaimer">
              Al confirmar generamos el pedido en el ERP de MEDISTOCK.
              El pago se gestiona luego desde el detalle del pedido (Webpay disponible para B2C).
            </p>
          </aside>
        </form>
      </div>
    </div>
  )
}
