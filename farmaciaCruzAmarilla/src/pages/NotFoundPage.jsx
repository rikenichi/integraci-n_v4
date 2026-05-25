import { Link } from 'react-router-dom'
import EmptyState from '../components/ui/EmptyState'

export default function NotFoundPage() {
  return (
    <div className="page container">
      <EmptyState
        icon="🔎"
        titulo="Página no encontrada"
        descripcion="La dirección que intentaste abrir no existe en nuestro sitio."
        accion={<Link to="/" className="btn btn-primary">Volver al inicio</Link>}
      />
    </div>
  )
}
