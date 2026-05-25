export default function Spinner({ inline = false, className = '' }) {
  return <div className={`spinner ${inline ? 'spinner-inline' : ''} ${className}`} role="status" aria-label="Cargando" />
}
