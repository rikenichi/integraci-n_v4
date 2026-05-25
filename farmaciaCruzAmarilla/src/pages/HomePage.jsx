import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { obtenerCatalogo } from '../services/medistockApi'
import { useApi } from '../hooks/useApi'
import { extraerLista, normalizarProducto } from '../utils/format'
import Spinner from '../components/ui/Spinner'
import ProductCard from '../components/ProductCard'
import './HomePage.css'

const BENEFICIOS = [
  { icono: '📡', titulo: 'Stock en vivo', desc: 'Inventario consultado en tiempo real al API de MEDISTOCK.' },
  { icono: '📍', titulo: 'Por sucursal', desc: 'Visibilidad del stock disponible en cada centro de distribución.' },
  { icono: '✉️', titulo: 'Cotización ágil', desc: 'Solicita precios institucionales en un clic.' },
  { icono: '🏥', titulo: 'Foco clínico', desc: 'Catálogo orientado a profesionales e instituciones de salud.' },
]

export default function HomePage() {
  const { data, error, cargando } = useApi(obtenerCatalogo)

  const productos = useMemo(() => extraerLista(data).map(normalizarProducto), [data])

  const destacados = productos.slice(0, 8)
  const categorias = useMemo(() => {
    const set = new Map()
    productos.forEach((p) => {
      if (!p.categoria) return
      set.set(p.categoria, (set.get(p.categoria) || 0) + 1)
    })
    return Array.from(set.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([nombre, count]) => ({ nombre, count }))
  }, [productos])

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <span className="hero-eyebrow">Portal B2B · Profesionales de la salud</span>
            <h1>
              Insumos clínicos con stock <span>en tiempo real</span>
            </h1>
            <p>
              Consulta el catálogo y stock <strong>en vivo</strong> de la red MEDISTOCK,
              nuestro distribuidor estratégico. Verifica disponibilidad por sucursal
              antes de solicitar cotización para tu clínica o consulta.
            </p>
            <div className="hero-cta">
              <Link to="/catalogo" className="btn btn-primary btn-lg">Explorar catálogo</Link>
              <Link to="/disponibilidad" className="btn btn-ghost btn-lg">Disponibilidad por sucursal</Link>
            </div>

            <div className="hero-stats">
              <div>
                <strong>{productos.length || '—'}</strong>
                <small>productos disponibles</small>
              </div>
              <div>
                <strong>5</strong>
                <small>centros de distribución</small>
              </div>
              <div>
                <strong>24 hrs</strong>
                <small>despacho RM</small>
              </div>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-inner">
              <span className="hero-card-tag">Powered by MEDISTOCK API</span>
              <h3>Conectados a la fuente</h3>
              <p>
                Nuestro catálogo se sincroniza directamente con el sistema de
                MEDISTOCK. Lo que ves es lo que hay disponible <em>ahora</em>.
              </p>
              <ul>
                <li>✔️ Inventario y precios consultados en vivo</li>
                <li>✔️ Pedidos creados directo en el ERP del distribuidor</li>
                <li>✔️ Tracking unificado con Chilexpress</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="container beneficios">
        {BENEFICIOS.map((b) => (
          <div key={b.titulo} className="beneficio">
            <span className="beneficio-icono" aria-hidden="true">{b.icono}</span>
            <div>
              <strong>{b.titulo}</strong>
              <p>{b.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {categorias.length > 0 && (
        <section className="container home-section">
          <div className="home-section-head">
            <h2>Categorías frecuentes</h2>
            <Link to="/catalogo" className="btn btn-link">Ver todo →</Link>
          </div>
          <div className="categorias-grid">
            {categorias.map((c) => (
              <Link
                key={c.nombre}
                to={`/catalogo?categoria=${encodeURIComponent(c.nombre)}`}
                className="categoria-chip"
              >
                <strong>{c.nombre}</strong>
                <small>{c.count} productos</small>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container home-section">
        <div className="home-section-head">
          <h2>Lo más solicitado</h2>
          <Link to="/catalogo" className="btn btn-link">Ver catálogo completo →</Link>
        </div>

        {cargando && <Spinner />}
        {error && (
          <div className="alert alert-error">
            No pudimos cargar el catálogo en este momento. Intenta refrescar la página.
          </div>
        )}

        {!cargando && !error && (
          <div className="productos-grid">
            {destacados.map((p) => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
