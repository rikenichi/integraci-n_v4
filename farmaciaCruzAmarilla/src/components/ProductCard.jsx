import { Link } from 'react-router-dom'
import { formatPrecio, truncar } from '../utils/format'
import Badge from './ui/Badge'
import Button from './ui/Button'
import { useCart } from '../context/CartContext'
import './ProductCard.css'

function obtenerInicial(nombre) {
  return (nombre || '?').trim().charAt(0).toUpperCase()
}

export default function ProductCard({ producto }) {
  const { agregar } = useCart()
  const sinStock = producto.stock_total <= 0

  return (
    <article className="product-card">
      <Link to={`/producto/${producto.codigo}`} className="product-card-media">
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
          <Link to={`/producto/${producto.codigo}`} className="product-card-title">
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

        <Button
          variant="primary"
          size="sm"
          block
          disabled={sinStock}
          onClick={() => agregar(producto, 1)}
        >
          {sinStock ? 'Sin stock' : 'Agregar al carro'}
        </Button>
      </div>
    </article>
  )
}
