import { Link, NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import Badge from './ui/Badge'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import './Header.css'

export default function Header() {
  const { usuario, cerrarSesion } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()

  const handleSalir = async () => {
    await cerrarSesion()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-top">
        <div className="container header-top-inner">
          <span>📞 +56 2 2222 1111</span>
          <span>🚚 Despacho a todo Chile</span>
          <span>💳 Convenios B2B con clínicas</span>
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
            <NavLink to="/sobre-nosotros">Nosotros</NavLink>
            {usuario && <NavLink to="/mis-pedidos">Mis pedidos</NavLink>}
          </nav>

          <div className="header-actions">
            {usuario ? (
              <div className="header-user">
                <div className="header-user-info">
                  <strong>{usuario.nombre || usuario.username}</strong>
                  {usuario.institucion_nombre && (
                    <small>{usuario.institucion_nombre}</small>
                  )}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={handleSalir}>Salir</button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-ghost btn-sm">Iniciar sesión</Link>
            )}

            <Link to="/carrito" className="header-cart" aria-label="Ver carrito">
              <span aria-hidden="true">🛒</span>
              <span>Carro</span>
              {totalItems > 0 && (
                <Badge variant="primary" className="header-cart-count">{totalItems}</Badge>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
