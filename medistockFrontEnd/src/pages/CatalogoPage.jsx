import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getCategorias, obtenerProductosCompatibles } from '../services/api'
import { useCarrito } from '../context/CarritoContext'
import { useAuth } from '../context/AuthContext'
import './CatalogoPage.css'

function formatPrecio(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n)
}

const bannersCatalogo = [
  {
    titulo: 'Insumos medicos con stock conectado',
    texto: 'Consulta disponibilidad, agrega productos y confirma tu pedido desde un solo flujo.',
    badge: 'Catalogo integrado',
  },
  {
    titulo: 'Despacho cotizado antes del pago',
    texto: 'El checkout calcula cobertura logistica usando las sucursales con stock suficiente.',
    badge: 'Logistica real',
  },
  {
    titulo: 'Atencion para B2C y B2B',
    texto: 'Pacientes e instituciones comparten el mismo catalogo con precios y beneficios diferenciados.',
    badge: 'Clientes B2C/B2B',
  },
]

function getStockBadge(producto) {
  const disponible = Number(producto.stock_disponible || 0)
  if (disponible > 10) return { label: 'Disponible', clase: 'badge-success' }
  if (disponible > 0) return { label: 'Stock bajo', clase: 'badge-warning' }
  return { label: 'Sin stock', clase: 'badge-danger' }
}

export default function CatalogoPage() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [filtros, setFiltros] = useState({ search: '', categoria: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bannerActivo, setBannerActivo] = useState(0)
  const [searchParams] = useSearchParams()
  const { agregarItem } = useCarrito()
  const { usuario } = useAuth()
  const esB2B = usuario?.rol === 'cliente_b2b' || usuario?.rol === 'ejecutivo'

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBannerActivo((actual) => (actual + 1) % bannersCatalogo.length)
    }, 5200)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    getCategorias().then(r => setCategorias(r.data.results || r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setFiltros(f => ({ ...f, search: searchParams.get('search') || '' }))
  }, [searchParams])

  useEffect(() => {
    setLoading(true)
    setError('')
    const params = {}
    if (filtros.search) params.search = filtros.search
    if (filtros.categoria) params.categoria = filtros.categoria

    obtenerProductosCompatibles(params)
      .then(data => setProductos(data))
      .catch(() => setError('No se pudo cargar el catálogo.'))
      .finally(() => setLoading(false))
  }, [filtros])

  return (
    <div className="page-container">
      <section className="catalogo-hero" aria-label="Beneficios del catalogo MEDISTOCK">
        <div className="catalogo-hero-copy">
          <span className="catalogo-eyebrow">{bannersCatalogo[bannerActivo].badge}</span>
          <h1>{bannersCatalogo[bannerActivo].titulo}</h1>
          <p>{bannersCatalogo[bannerActivo].texto}</p>
          <div className="catalogo-hero-actions">
            <span>Pago seguro</span>
            <span>Stock por sucursal</span>
            <span>Despacho integrado</span>
          </div>
        </div>
        <div className="catalogo-hero-metrics">
          <div><strong>{productos.length}</strong><span>productos visibles</span></div>
          <div><strong>{categorias.length}</strong><span>categorias</span></div>
          <div><strong>{esB2B ? 'B2B' : 'B2C'}</strong><span>perfil de precio</span></div>
        </div>
        <div className="catalogo-dots" aria-hidden="true">
          {bannersCatalogo.map((banner, index) => (
            <button
              key={banner.titulo}
              className={index === bannerActivo ? 'activo' : ''}
              type="button"
              onClick={() => setBannerActivo(index)}
              aria-label={`Ver banner ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <div className="catalogo-header">
        <h1 className="page-title">Catálogo de Productos</h1>
        {esB2B && <span className="badge badge-info">Precios B2B institucional</span>}
      </div>

      <div className="filtros card">
        <input
          type="text" placeholder="Buscar producto..."
          value={filtros.search}
          onChange={e => setFiltros(f => ({ ...f, search: e.target.value }))}
        />
        <select
          value={filtros.categoria}
          onChange={e => setFiltros(f => ({ ...f, categoria: e.target.value }))}
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner" />
      ) : productos.length === 0 ? (
        <div className="text-center text-muted mt-3">No se encontraron productos.</div>
      ) : (
        <div className="grid-4">
          {productos.map(p => (
            <div key={p.id} className="producto-card card">
              {(() => {
                const stockBadge = getStockBadge(p)
                return (
                  <span className={`producto-stock-badge badge ${stockBadge.clase}`}>
                    {stockBadge.label}
                  </span>
                )
              })()}
              <div className="producto-img">
                {p.imagen_url
                  ? <img src={p.imagen_url} alt={p.nombre} />
                  : <span className="producto-icon">🏥</span>
                }
              </div>
              <div className="producto-body">
                <span className="producto-codigo text-muted">{p.codigo}</span>
                <h3 className="producto-nombre">{p.nombre}</h3>
                <p className="producto-categoria text-muted">{p.categoria_nombre}</p>
                <div className="producto-precio">
                  {formatPrecio(esB2B ? p.precio_b2b : p.precio_b2c)}
                  {esB2B && (
                    <span className="text-muted" style={{fontSize:'0.75rem', display:'block'}}>
                      + 10% descuento institucional
                    </span>
                  )}
                </div>
                {p.requiere_receta && (
                  <span className="badge badge-warning">Requiere receta</span>
                )}
              </div>
              <div className="producto-acciones">
                <Link to={`/producto/${p.id}`} className="btn btn-secondary btn-sm">
                  Ver detalle
                </Link>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => agregarItem(p)}
                  disabled={Number(p.stock_disponible || 0) <= 0}
                >
                  Agregar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
