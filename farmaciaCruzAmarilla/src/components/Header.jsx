import { Link, NavLink } from 'react-router-dom'
import Logo from './Logo'
import './Header.css'

export default function Header() {
  return (
    <header className="header">
      <div className="header-top">
        <div className="container header-top-inner">
          <span>📞 +56 2 2222 1111</span>
          <span>🚚 Distribución a todo Chile vía MEDISTOCK</span>
          <span>💼 Atención B2B y profesionales de la salud</span>
        </div>
      </div>

      <div className="header-main">
        <div className="container header-main-inner">
          <Link to="/" className="header-brand">
            <Logo />
          </Link>

          <nav className="header-nav" aria-label="Principal">
            <NavLink to="/" end>Inicio</NavLink>
            <NavLink to="/catalogo">Catálogo</NavLink>
            <NavLink to="/disponibilidad">Disponibilidad</NavLink>
            <NavLink to="/sobre-nosotros">Nosotros</NavLink>
          </nav>

          <div className="header-actions">
            <a className="btn btn-ghost btn-sm" href="mailto:b2b@cruzamarilla.cl">Contactar</a>
            <Link to="/catalogo" className="header-cta">Ver catálogo</Link>
          </div>
        </div>
      </div>
    </header>
  )
}
