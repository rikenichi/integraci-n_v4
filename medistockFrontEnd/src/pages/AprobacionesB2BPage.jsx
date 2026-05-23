import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  aprobarRevisionB2B,
  observarRevisionB2B,
  obtenerAprobacionesB2B,
  rechazarRevisionB2B,
} from '../services/api'
import './AprobacionesB2BPage.css'

const ROLES_PERMITIDOS = ['admin', 'ejecutivo', 'analista']

const ESTADOS = {
  pendiente: { label: 'Pendiente', clase: 'badge-warning' },
  aprobado: { label: 'Aprobado', clase: 'badge-success' },
  rechazado: { label: 'Rechazado', clase: 'badge-danger' },
  observado: { label: 'Observado', clase: 'badge-info' },
}

function formatFecha(fecha) {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPrecio(valor) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(valor || 0)
}

function obtenerLista(data) {
  return data?.results || data || []
}

function getEstado(estado) {
  return ESTADOS[estado] || { label: estado || 'Sin estado', clase: 'badge-secondary' }
}

export default function AprobacionesB2BPage() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [aprobaciones, setAprobaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accionandoId, setAccionandoId] = useState(null)

  const autorizado = ROLES_PERMITIDOS.includes(usuario?.rol)

  const cargarDatos = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await obtenerAprobacionesB2B()
      setAprobaciones(obtenerLista(data))
    } catch (e) {
      setError(e.response?.data?.detail || 'No se pudieron cargar las aprobaciones B2B.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autorizado) cargarDatos()
  }, [autorizado])

  const ejecutarAccion = async (id, accion) => {
    setAccionandoId(id)
    setError('')
    try {
      await accion(id)
      await cargarDatos()
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.detail || 'No se pudo actualizar la aprobación.')
    } finally {
      setAccionandoId(null)
    }
  }

  if (!autorizado) {
    return (
      <div className="page-container aprobaciones-page">
        <div className="aprobaciones-toolbar">
          <button className="btn btn-secondary" onClick={() => navigate('/panel')}>
            Ir al panel
          </button>
        </div>
        <div className="card aprobaciones-acceso">
          <h1>Acceso no autorizado</h1>
          <p className="text-muted">
            Esta vista está disponible solo para roles comerciales y financieros autorizados.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container aprobaciones-page">
      <div className="aprobaciones-header">
        <div>
          <p className="aprobaciones-kicker">Revisión comercial</p>
          <h1 className="page-title">Aprobaciones B2B <span className="demo-chip">Demo</span></h1>
          <p className="text-muted">
            Vista demo para defender el flujo de revisión comercial de pedidos institucionales.
          </p>
        </div>
        <div className="aprobaciones-toolbar">
          <button className="btn btn-secondary" onClick={() => navigate('/panel')}>
            Ir al panel
          </button>
          <button className="btn btn-primary" onClick={cargarDatos} disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="spinner" />
      ) : (
        <section className="tabla-container card">
          <div className="aprobaciones-section-header">
            <h2>Revisiones registradas</h2>
            <span>{aprobaciones.length} aprobaciones</span>
          </div>
          {aprobaciones.length === 0 ? (
            <p className="text-muted aprobaciones-empty">No hay aprobaciones B2B registradas.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Pedido</th>
                  <th>Cliente / institución</th>
                  <th>Tipo</th>
                  <th>Total</th>
                  <th>Ejecutivo</th>
                  <th>Revisión</th>
                  <th>Estado</th>
                  <th>Comentario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {aprobaciones.map(aprobacion => {
                  const estado = getEstado(aprobacion.estado_aprobacion)
                  const bloqueado = accionandoId === aprobacion.id
                  return (
                    <tr key={aprobacion.id}>
                      <td>#{aprobacion.id}</td>
                      <td>#{aprobacion.pedido}</td>
                      <td>
                        <strong>{aprobacion.cliente_institucion || aprobacion.cliente_username || '-'}</strong>
                        {aprobacion.cliente_institucion && aprobacion.cliente_username && (
                          <>
                            <br />
                            <span className="text-muted">{aprobacion.cliente_username}</span>
                          </>
                        )}
                      </td>
                      <td>{aprobacion.pedido_tipo_cliente?.toUpperCase() || '-'}</td>
                      <td>{formatPrecio(aprobacion.pedido_total)}</td>
                      <td>{aprobacion.ejecutivo_username || '-'}</td>
                      <td>{formatFecha(aprobacion.fecha_revision)}</td>
                      <td><span className={`badge ${estado.clase}`}>{estado.label}</span></td>
                      <td>{aprobacion.comentario || '-'}</td>
                      <td>
                        <div className="aprobaciones-acciones">
                          <button
                            className="btn btn-success btn-sm"
                            disabled={bloqueado}
                            onClick={() => ejecutarAccion(aprobacion.id, aprobarRevisionB2B)}
                          >
                            Aprobar
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={bloqueado}
                            onClick={() => ejecutarAccion(aprobacion.id, rechazarRevisionB2B)}
                          >
                            Rechazar
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            disabled={bloqueado}
                            onClick={() => ejecutarAccion(aprobacion.id, observarRevisionB2B)}
                          >
                            Observar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  )
}
