import './EmptyState.css'

export default function EmptyState({ icon = '∅', titulo, descripcion, accion }) {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">{icon}</div>
      {titulo && <h3>{titulo}</h3>}
      {descripcion && <p className="text-muted">{descripcion}</p>}
      {accion && <div className="empty-action">{accion}</div>}
    </div>
  )
}
