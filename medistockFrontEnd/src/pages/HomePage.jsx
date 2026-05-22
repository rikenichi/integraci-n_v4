import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerProductosCompatibles } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'
import './HomePage.css'

function formatPrecio(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n)
}

const beneficios = [
  { titulo: 'Despacho rapido', texto: 'Cotiza cobertura y plazo antes de pagar tu pedido.', icono: 'D' },
  { titulo: 'Pago seguro', texto: 'Webpay Plus TEST integrado al flujo de compra.', icono: 'P' },
  { titulo: 'Stock en linea', texto: 'Disponibilidad conectada con la API propia MEDISTOCK.', icono: 'S' },
  { titulo: 'Clinicas y pacientes', texto: 'Precios diferenciados para pacientes e instituciones.', icono: 'C' },
]

export default function HomePage() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { usuario } = useAuth()
  const { agregarItem } = useCarrito()
  const esB2B = usuario?.rol === 'cliente_b2b' || usuario?.rol === 'ejecutivo'

  useEffect(() => {
    obtenerProductosCompatibles()
      .then(data => setProductos(data.slice(0, 8)))
      .catch(() => setError('No se pudieron cargar los productos destacados.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-eyebrow">Farmacia e insumos medicos online</span>
          <h1>Compra medicamentos e insumos medicos en linea</h1>
          <p>
            Gestiona productos, stock, despacho y pago seguro en una plataforma
            preparada para pacientes y clinicas.
          </p>
          <div className="home-hero-actions">
            <Link className="btn btn-primary btn-lg" to="/catalogo">Ver catalogo</Link>
            <Link className="btn btn-secondary btn-lg" to="/carrito">Ir al carrito</Link>
          </div>
        </div>
        <div className="home-hero-panel" aria-label="Resumen de servicios MEDISTOCK">
          <div>
            <strong>Cotiza despacho</strong>
            <span>antes de pagar</span>
          </div>
          <div>
            <strong>Webpay Plus</strong>
            <span>ambiente TEST</span>
          </div>
          <div>
            <strong>Stock actualizado</strong>
            <span>por sucursal</span>
          </div>
        </div>
      </section>

      <section className="home-benefits">
        {beneficios.map(beneficio => (
          <article className="home-benefit" key={beneficio.titulo}>
            <span className="benefit-icon">{beneficio.icono}</span>
            <div>
              <h3>{beneficio.titulo}</h3>
              <p>{beneficio.texto}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="home-section">
        <div className="home-section-header">
          <div>
            <span className="home-eyebrow">Productos desde la API</span>
            <h2>Productos destacados</h2>
          </div>
          <Link to="/catalogo" className="btn btn-secondary btn-sm">Ver todos</Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="spinner" />
        ) : (
          <div className="home-products">
            {productos.map(producto => {
              const precio = esB2B ? producto.precio_b2b : producto.precio_b2c
              return (
                <article className="home-product-card" key={producto.id}>
                  <Link to={`/producto/${producto.codigo}`} className="home-product-media">
                    {producto.imagen_url
                      ? <img src={producto.imagen_url} alt={producto.nombre} />
                      : <span>+</span>
                    }
                  </Link>
                  <div className="home-product-body">
                    <span className="home-product-code">{producto.codigo}</span>
                    <h3>{producto.nombre}</h3>
                    <p>{producto.categoria_nombre || 'Insumo medico'}</p>
                    <div className="home-product-meta">
                      <strong>{formatPrecio(precio)}</strong>
                      <span>Stock en linea</span>
                    </div>
                  </div>
                  <div className="home-product-actions">
                    <Link to={`/producto/${producto.codigo}`} className="btn btn-secondary btn-sm">Ver producto</Link>
                    <button className="btn btn-primary btn-sm" onClick={() => agregarItem(producto)}>
                      Agregar
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="home-platform-banner">
        <div>
          <span className="home-eyebrow">Integracion MEDISTOCK</span>
          <h2>Integramos pagos, stock y despacho en una sola plataforma</h2>
          <p>API propia, Webpay Plus y courier conectados al mismo flujo ecommerce.</p>
        </div>
        <Link className="btn btn-primary" to="/catalogo">Comprar ahora</Link>
      </section>

      <footer className="home-footer">
        <div>
          <h3>MEDISTOCK</h3>
          <p>Proyecto ecommerce para integracion de plataformas en salud.</p>
        </div>
        <div>
          <h4>Contacto</h4>
          <p>contacto@medistock.cl</p>
          <p>+56 2 2345 6789</p>
        </div>
        <div>
          <h4>Horario</h4>
          <p>Lunes a viernes: 09:00 a 18:00</p>
          <p>Sabado: 09:00 a 13:00</p>
        </div>
        <div>
          <h4>Enlaces utiles</h4>
          <Link to="/catalogo">Catalogo</Link>
          <Link to="/carrito">Carrito</Link>
          <Link to="/panel">Mi panel</Link>
        </div>
        <div>
          <h4>Politicas</h4>
          <p>Despacho sujeto a cobertura.</p>
          <p>Pagos procesados en ambiente TEST.</p>
        </div>
      </footer>
    </main>
  )
}
