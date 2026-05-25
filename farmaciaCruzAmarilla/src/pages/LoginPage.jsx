import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import './LoginPage.css'

export default function LoginPage() {
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await iniciarSesion(username, password)
      navigate(redirect, { replace: true })
    } catch {
      setError('Credenciales incorrectas o usuario sin permisos para comprar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="container login-grid">
        <div className="login-info">
          <span className="badge badge-primary">Portal B2B</span>
          <h1>Compra con tu cuenta MEDISTOCK</h1>
          <p>
            Farmacia Cruz Amarilla opera sobre la red de distribución de <strong>MEDISTOCK</strong>.
            Usa tus credenciales habituales para acceder a precios institucionales,
            historial de pedidos y boleta o factura tributaria.
          </p>

          <ul className="login-benefits">
            <li>✔️ Precio B2B según convenio activo</li>
            <li>✔️ Acceso a tu historial de pedidos centralizado</li>
            <li>✔️ Pago seguro con Webpay Plus o transferencia</li>
          </ul>

          <div className="login-note">
            <strong>¿No tienes cuenta?</strong>
            <p>
              Solicita tu registro a través del equipo MEDISTOCK escribiendo a{' '}
              <a href="mailto:b2b@medistock.cl">b2b@medistock.cl</a>.
            </p>
          </div>
        </div>

        <form className="login-form card" onSubmit={handleSubmit}>
          <h2>Iniciar sesión</h2>
          <p className="text-muted mb-2">Ingresa con tu cuenta MEDISTOCK.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="field">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              autoFocus
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="tu.usuario"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button variant="primary" size="lg" block loading={loading} type="submit">
            {loading ? 'Validando…' : 'Iniciar sesión'}
          </Button>

          <Link to="/" className="btn btn-link mt-2" style={{ display: 'block', textAlign: 'center' }}>
            ← Seguir comprando sin cuenta
          </Link>
        </form>
      </div>
    </div>
  )
}
