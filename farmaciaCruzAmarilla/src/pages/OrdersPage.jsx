import { Link, useSearchParams } from 'react-router-dom'
import { obtenerMisPedidos } from '../services/medistockApi'
import { useApi } from '../hooks/useApi'
import { capitalizar, extraerLista, formatFecha, formatPrecio } from '../utils/format'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import './OrdersPage.css'

const VARIANTE_ESTADO = {
  pendiente: 'warning',
  aprobado: 'info',
  en_preparacion: 'info',
  despachado: 'info',
  entregado: 'success',
  cancelado: 'danger',
  rechazado: 'danger',
}

export default function OrdersPage() {
  const { data, cargando, error } = useApi(obtenerMisPedidos)
  const [searchParams] = useSearchParams()
  const recienId = searchParams.get('recien')

  const pedidos = extraerLista(data)

  if (cargando) return <div className="page container"><Spinner /></div>

  if (error || !pedidos.length) {
    return (
      <div className="page container">
        <div className="page-header">
          <div>
            <h1>Mis pedidos</h1>
            <p className="text-muted">Historial de compras procesadas vía MEDISTOCK.</p>
          </div>
        </div>
        {error && !pedidos.length ? (
          <div className="alert alert-error">
            No pudimos cargar tus pedidos en este momento.
          </div>
        ) : (
          <EmptyState
            icon="📦"
            titulo="Aún no tienes pedidos"
            descripcion="Cuando confirmes tu primera compra, aparecerá aquí."
            accion={<Link to="/catalogo" className="btn btn-primary">Ir al catálogo</Link>}
          />
        )}
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Mis pedidos</h1>
            <p className="text-muted">{pedidos.length} pedido{pedidos.length === 1 ? '' : 's'} en tu historial.</p>
          </div>
        </div>

        {recienId && (
          <div className="alert alert-success">
            ✅ Tu pedido #{recienId} fue creado correctamente. Lo encontrarás listado abajo.
          </div>
        )}

        <div className="orders-list">
          {pedidos.map((p) => {
            const estado = String(p.estado || p.estado_pedido || '').toLowerCase()
            const variant = VARIANTE_ESTADO[estado] || 'neutral'
            return (
              <article key={p.id} className="card order-card">
                <div className="order-card-head">
                  <div>
                    <span className="text-muted small">Pedido</span>
                    <strong>#{p.id}</strong>
                  </div>
                  <div>
                    <span className="text-muted small">Fecha</span>
                    <strong>{formatFecha(p.creado_en || p.fecha_creacion)}</strong>
                  </div>
                  <div>
                    <span className="text-muted small">Tipo</span>
                    <strong>{capitalizar(p.tipo_venta || p.tipo_cliente || '-')}</strong>
                  </div>
                  <div>
                    <span className="text-muted small">Total</span>
                    <strong>{formatPrecio(p.total)}</strong>
                  </div>
                  <div className="order-card-estado">
                    <Badge variant={variant}>{p.estado_display || capitalizar(estado)}</Badge>
                  </div>
                </div>

                {Array.isArray(p.detalles) && p.detalles.length > 0 && (
                  <ul className="order-detalles">
                    {p.detalles.slice(0, 4).map((d, i) => (
                      <li key={`${p.id}-${i}`}>
                        <span>{d.cantidad} × {d.producto_nombre || `Producto ${d.producto_id || d.producto}`}</span>
                        <small>{formatPrecio(d.subtotal || d.precio_unitario * d.cantidad)}</small>
                      </li>
                    ))}
                    {p.detalles.length > 4 && (
                      <li><small className="text-muted">…y {p.detalles.length - 4} producto(s) más</small></li>
                    )}
                  </ul>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
