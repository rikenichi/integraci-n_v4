import { Link } from 'react-router-dom'
import './AboutPage.css'

export default function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container">
          <span className="badge badge-primary">Sobre nosotros</span>
          <h1>Una farmacia con cobertura clínica nacional</h1>
          <p>
            Farmacia Cruz Amarilla opera desde 1985 con foco en abastecimiento clínico
            de calidad. Hoy operamos una plataforma digital integrada al ERP de
            <strong> MEDISTOCK</strong>, lo que nos permite ofrecer stock en tiempo real
            y precios B2B con convenios activos.
          </p>
        </div>
      </section>

      <section className="container about-grid">
        <article className="card">
          <h3>📡 Integración técnica</h3>
          <p>
            Consumimos la <strong>API REST de MEDISTOCK</strong> en cada visita: catálogo,
            categorías públicas, stock por sucursal, creación de pedidos y consulta
            de historial. La autenticación se delega vía <em>JWT</em>.
          </p>
        </article>
        <article className="card">
          <h3>🤝 Convenios B2B</h3>
          <p>
            Clínicas, hospitales y consultas pueden solicitar su registro institucional
            para acceder a precios preferentes, condiciones de pago y consolidación
            mensual de facturación.
          </p>
        </article>
        <article className="card">
          <h3>🚚 Logística</h3>
          <p>
            Despacho coordinado con <strong>Chilexpress</strong> a todo el territorio
            chileno. Retiro en sucursal disponible en Providencia.
          </p>
        </article>
        <article className="card">
          <h3>💳 Pagos</h3>
          <p>
            Webpay Plus (Transbank) para clientes particulares y transferencia o
            convenio facturado a fin de mes para instituciones.
          </p>
        </article>
      </section>

      <section className="about-cta">
        <div className="container">
          <h2>¿Necesitas un proveedor confiable?</h2>
          <p>Escríbenos y activamos tu cuenta institucional en menos de 48 horas.</p>
          <div className="about-cta-actions">
            <a href="mailto:b2b@medistock.cl" className="btn btn-primary btn-lg">Solicitar convenio</a>
            <Link to="/catalogo" className="btn btn-ghost btn-lg">Ver catálogo</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
