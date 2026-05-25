import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { obtenerProductoPublico } from '../services/medistockApi'
import { useApi } from '../hooks/useApi'
import { formatPrecio, normalizarProducto } from '../utils/format'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { useCart } from '../context/CartContext'
import './ProductDetailPage.css'

export default function ProductDetailPage() {
  const { codigo } = useParams()
  const navigate = useNavigate()
  const { agregar } = useCart()
  const [cantidad, setCantidad] = useState(1)

  const { data, cargando, error } = useApi(() => obtenerProductoPublico(codigo), [codigo])
  const producto = data ? normalizarProducto(data) : null

  if (cargando) return <div className="page container"><Spinner /></div>
  if (error || !producto) {
    return (
      <div className="page container">
        <div className="alert alert-error">No encontramos este producto.</div>
        <Link to="/catalogo" className="btn btn-ghost">← Volver al catálogo</Link>
      </div>
    )
  }

  const sinStock = producto.stock_total <= 0

  const handleAgregar = () => {
    agregar(producto, cantidad)
    navigate('/carrito')
  }

  return (
    <div className="page">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Inicio</Link> /{' '}
          <Link to="/catalogo">Catálogo</Link> /{' '}
          {producto.categoria && (
            <>
              <Link to={`/catalogo?categoria=${encodeURIComponent(producto.categoria)}`}>
                {producto.categoria}
              </Link>{' '}
              /{' '}
            </>
          )}
          <span>{producto.nombre}</span>
        </nav>

        <div className="product-detail">
          <div className="product-detail-media">
            {producto.imagen ? (
              <img src={producto.imagen} alt={producto.nombre} />
            ) : (
              <span className="product-detail-placeholder">
                {producto.nombre.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="product-detail-info">
            {producto.categoria && <span className="text-muted small">{producto.categoria}</span>}
            <h1>{producto.nombre}</h1>
            {producto.marca && <p className="text-muted">{producto.marca}</p>}

            <div className="product-detail-badges">
              {producto.requiere_receta && <Badge variant="info">Requiere receta</Badge>}
              {sinStock ? (
                <Badge variant="danger">Sin stock</Badge>
              ) : (
                <Badge variant="success">
                  Disponible · {producto.stock_total} unidades
                </Badge>
              )}
              <Badge variant="neutral">Cód. {producto.codigo}</Badge>
            </div>

            <div className="product-detail-price">
              <strong>{formatPrecio(producto.precio)}</strong>
              <small>por {producto.unidad} · IVA incluido</small>
            </div>

            {producto.descripcion && (
              <div className="product-detail-desc">
                <h3>Descripción</h3>
                <p>{producto.descripcion}</p>
              </div>
            )}

            <div className="product-detail-actions">
              <div className="cantidad-control">
                <button
                  type="button"
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  disabled={cantidad <= 1}
                  aria-label="Disminuir"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, Number(e.target.value) || 1))}
                />
                <button
                  type="button"
                  onClick={() => setCantidad((c) => c + 1)}
                  aria-label="Aumentar"
                >
                  +
                </button>
              </div>

              <Button variant="primary" size="lg" onClick={handleAgregar} disabled={sinStock}>
                {sinStock ? 'Sin stock' : 'Agregar al carrito'}
              </Button>
            </div>

            <div className="product-detail-trust">
              <div>🚚 <strong>Despacho 24–48h</strong> en RM</div>
              <div>💳 <strong>Webpay y convenios B2B</strong></div>
              <div>📋 <strong>Boleta o factura</strong> según cliente</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
