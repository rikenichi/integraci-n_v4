import Logo from './Logo'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p className="text-muted mt-2">
            Tu socio confiable en abastecimiento clínico desde 1985.
            Atendemos profesionales, clínicas y pacientes en todo Chile.
          </p>
        </div>

        <div>
          <h4>Atención</h4>
          <ul>
            <li>📞 +56 2 2222 1111</li>
            <li>✉️ contacto@cruzamarilla.cl</li>
            <li>📍 Av. Providencia 1234, Santiago</li>
            <li>🕒 Lun–Vie 9:00 – 19:00</li>
          </ul>
        </div>

        <div>
          <h4>Información</h4>
          <ul>
            <li>Política de privacidad</li>
            <li>Términos y condiciones</li>
            <li>Política de despacho</li>
            <li>Convenios institucionales</li>
          </ul>
        </div>

        <div>
          <h4>Integración</h4>
          <p className="text-muted small">
            Este portal opera con el catálogo y stock de <strong>MEDISTOCK</strong>,
            nuestro distribuidor estratégico de insumos clínicos.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <small>© {new Date().getFullYear()} Farmacia Cruz Amarilla — Catálogo y stock provistos por MEDISTOCK API.</small>
        </div>
      </div>
    </footer>
  )
}
