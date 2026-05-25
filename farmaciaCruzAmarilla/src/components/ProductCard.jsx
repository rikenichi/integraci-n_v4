import { Link } from 'react-router-dom'
import { formatPrecio, truncar, urlCotizacion } from '../utils/format'
import Badge from './ui/Badge'
import './ProductCard.css'

function obtenerInicial(nombre) {
  return (nombre || '?').trim().charAt(0).toUpperCase()
}

export default function ProductCard({ producto }) {
  const sinStock = producto.stock_total <= 0

  return (
    <article className="product-card">
      <Link to={`/producto/${producto.id}`} className="product-card-media">
        {producto.imagen ? (
          <img src={producto.imagen} alt={producto.nombre} loading="lazy" />
        ) : (
          <span className="product-card-placeholder">{obtenerInicial(producto.nombre)}</span>
        )}
        {producto.requiere_receta && (
          <Badge variant="info" className="product-card-badge">Receta</Badge>
        )}
      </Link>

      <div className="product-card-body">
        <div>
          {producto.categoria && (
            <span className="product-card-categoria">{producto.categoria}</span>
          )}
          <Link to={`/producto/${producto.id}`} className="product-card-title">
            {truncar(producto.nombre, 60)}
          </Link>
          {producto.marca && (
            <span className="product-card-marca">{producto.marca}</span>
          )}
        </div>

        <div className="product-card-foot">
          <div className="product-card-price">
            <strong>{formatPrecio(producto.precio)}</strong>
            <small>por {producto.unidad}</small>
          </div>

          <div className="product-card-stock">
            {sinStock ? (
              <Badge variant="danger">Sin stock</Badge>
            ) : producto.stock_total < 20 ? (
              <Badge variant="warning">{producto.stock_total} disp.</Badge>
            ) : (
              <Badge variant="success">Disponible</Badge>
            )}
          </div>
        </div>

        <div className="product-card-actions">
          <Link to={`/producto/${producto.id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
            Ver detalle
          </Link>
          <a
            href={urlCotizacion(producto)}
            className="btn btn-ghost btn-sm"
            title="Solicitar cotización por email"
          >
            ✉
          </a>
        </div>
      </div>
    </article>
  )
}
