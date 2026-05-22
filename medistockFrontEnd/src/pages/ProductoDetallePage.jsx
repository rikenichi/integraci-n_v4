import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { obtenerProductoCompatible, obtenerStockProductoCompatible } from '../services/api'
import { useCarrito } from '../context/CarritoContext'
import { useAuth } from '../context/AuthContext'
import './ProductoDetallePage.css'

function formatPrecio(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n)
}

export default function ProductoDetallePage() {
  const { codigo } = useParams()
  const [producto, setProducto] = useState(null)
  const [stock, setStock] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingStock, setLoadingStock] = useState(false)
  const [error, setError] = useState('')
  const [agregado, setAgregado] = useState(false)
  const { agregarItem } = useCarrito()
  const { usuario } = useAuth()
  const esB2B = usuario?.rol === 'cliente_b2b' || usuario?.rol === 'ejecutivo'

  useEffect(() => {
    setLoading(true)
    obtenerProductoCompatible(codigo)
      .then(data => setProducto(data))
      .catch(() => setError('Producto no encontrado.'))
      .finally(() => setLoading(false))
  }, [codigo])

  const verStock = () => {
    setLoadingStock(true)
    obtenerStockProductoCompatible(codigo)
      .then(data => setStock(data))
      .catch(() => setError('No se pudo cargar el stock.'))
      .finally(() => setLoadingStock(false))
  }

  const handleAgregar = () => {
    agregarItem(producto, cantidad)
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  if (loading) return <div className="spinner" />
  if (error) return <div className="page-container"><div className="alert alert-error">{error}</div></div>
  if (!producto) return null

  const precio = esB2B ? producto.precio_b2b : producto.precio_b2c

  return (
    <div className="page-container">
      <Link to="/catalogo" className="text-muted" style={{fontSize:'0.875rem'}}>← Volver al catálogo</Link>

      <div className="detalle-grid mt-2">
        <div className="detalle-imagen card">
          <span style={{fontSize:'5rem'}}>🏥</span>
          <span className="badge badge-secondary mt-1">{producto.categoria_nombre}</span>
        </div>

        <div className="detalle-info">
          <div className="card">
            <p className="text-muted" style={{fontSize:'0.8rem'}}>{producto.codigo}</p>
            <h1 style={{fontSize:'1.5rem', fontWeight:700, margin:'8px 0'}}>{producto.nombre}</h1>

            {producto.requiere_receta && (
              <span className="badge badge-warning" style={{marginBottom:12}}>Requiere receta médica</span>
            )}

            <p style={{color:'var(--color-text-muted)', marginBottom:16}}>{producto.descripcion}</p>

            <div className="precio-container">
              <span className="precio-label">{esB2B ? 'Precio B2B' : 'Precio'}</span>
              <span className="precio-valor">{formatPrecio(precio)}</span>
              {esB2B && <span className="text-muted" style={{fontSize:'0.8rem'}}>con 10% descuento al facturar</span>}
            </div>

            <p className="text-muted" style={{fontSize:'0.85rem'}}>
              Unidad: {producto.unidad_medida}
            </p>

            <hr className="divider" />

            <div style={{display:'flex', gap:12, alignItems:'center', marginBottom:16}}>
              <label style={{fontWeight:500}}>Cantidad:</label>
              <input
                type="number" min={1} value={cantidad}
                onChange={e => setCantidad(parseInt(e.target.value) || 1)}
                style={{width:80, padding:'8px', border:'1px solid var(--color-border)', borderRadius:'var(--radius)'}}
              />
            </div>

            <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
              <button
                className={`btn btn-primary btn-lg ${agregado ? 'btn-success' : ''}`}
                onClick={handleAgregar}
              >
                {agregado ? '✓ Agregado al carrito' : '🛒 Agregar al carrito'}
              </button>
              <button className="btn btn-secondary" onClick={verStock} disabled={loadingStock}>
                {loadingStock ? 'Consultando...' : '📦 Ver stock por sucursal'}
              </button>
            </div>
          </div>

          {stock && (
            <div className="card mt-2">
              <h3 className="section-title">Stock por sucursal</h3>
              {stock.stock_por_sucursal.length === 0 ? (
                <p className="text-muted">Sin stock registrado.</p>
              ) : (
                <table className="stock-table">
                  <thead>
                    <tr>
                      <th>Sucursal</th>
                      <th>Ciudad</th>
                      <th>Disponible</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock.stock_por_sucursal.map(s => (
                      <tr key={s.sucursal_id}>
                        <td>{s.sucursal}</td>
                        <td>{s.ciudad}</td>
                        <td><strong>{s.disponible}</strong></td>
                        <td>
                          <span className={`badge ${s.disponible > 5 ? 'badge-success' : s.disponible > 0 ? 'badge-warning' : 'badge-danger'}`}>
                            {s.disponible > 5 ? 'Disponible' : s.disponible > 0 ? 'Stock bajo' : 'Sin stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
