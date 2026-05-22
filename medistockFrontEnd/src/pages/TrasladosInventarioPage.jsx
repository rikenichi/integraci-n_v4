import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  cancelarTrasladoInventario,
  marcarTrasladoEnTransito,
  marcarTrasladoRecibido,
  obtenerTrasladosInventario,
} from '../services/api'
import './TrasladosInventarioPage.css'

const ROLES_INTERNOS = ['admin', 'operador', 'analista']

const ESTADOS = {
  borrador: { label: 'Borrador', clase: 'badge-secondary' },
  solicitado: { label: 'Solicitado', clase: 'badge-info' },
  en_transito: { label: 'En tránsito', clase: 'badge-warning' },
  recibido: { label: 'Recibido', clase: 'badge-success' },
  cancelado: { label: 'Cancelado', clase: 'badge-danger' },
}

function formatFecha(fecha) {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function obtenerLista(data) {
  return data?.results || data || []
}

function getEstado(estado) {
  return ESTADOS[estado] || { label: estado || 'Sin estado', clase: 'badge-secondary' }
}

export default function TrasladosInventarioPage() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [traslados, setTraslados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accionandoId, setAccionandoId] = useState(null)

  const autorizado = ROLES_INTERNOS.includes(usuario?.rol)

  const cargarDatos = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await obtenerTrasladosInventario()
      setTraslados(obtenerLista(data))
    } catch (e) {
      setError(e.response?.data?.detail || 'No se pudieron cargar los traslados de inventario.')
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
      setError(e.response?.data?.detail || 'No se pudo actualizar el traslado.')
    } finally {
      setAccionandoId(null)
    }
  }

  if (!autorizado) {
    return (
      <div className="page-container traslados-page">
        <div className="traslados-toolbar">
          <button className="btn btn-secondary" onClick={() => navigate('/panel')}>
            Ir al panel
          </button>
        </div>
        <div className="card traslados-acceso">
          <h1>Acceso no autorizado</h1>
          <p className="text-muted">
            Esta vista está disponible solo para roles internos de MEDISTOCK.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container traslados-page">
      <div className="traslados-header">
        <div>
          <p className="traslados-kicker">Inventario interno</p>
          <h1 className="page-title">Traslados de inventario</h1>
          <p className="text-muted">
            Seguimiento administrativo de transferencias entre sucursales.
          </p>
        </div>
        <div className="traslados-toolbar">
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
          <div className="traslados-section-header">
            <h2>Transferencias registradas</h2>
            <span>{traslados.length} traslados</span>
          </div>
          {traslados.length === 0 ? (
            <p className="text-muted traslados-empty">No hay traslados de inventario registrados.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Origen</th>
                  <th>Destino</th>
                  <th>Usuario</th>
                  <th>Solicitud</th>
                  <th>Envío</th>
                  <th>Recepción</th>
                  <th>Estado</th>
                  <th>Observación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {traslados.map(traslado => {
                  const estado = getEstado(traslado.estado)
                  const bloqueado = accionandoId === traslado.id
                  const mostrarEnTransito = ['borrador', 'solicitado'].includes(traslado.estado)
                  const mostrarRecibido = traslado.estado === 'en_transito'
                  const mostrarCancelar = !['recibido', 'cancelado'].includes(traslado.estado)

                  return (
                    <tr key={traslado.id}>
                      <td>#{traslado.id}</td>
                      <td>{traslado.sucursal_origen_nombre || '-'}</td>
                      <td>{traslado.sucursal_destino_nombre || '-'}</td>
                      <td>{traslado.usuario_username || '-'}</td>
                      <td>{formatFecha(traslado.fecha_solicitud)}</td>
                      <td>{formatFecha(traslado.fecha_envio)}</td>
                      <td>{formatFecha(traslado.fecha_recepcion)}</td>
                      <td>
                        <span className={`badge ${estado.clase}`}>{estado.label}</span>
                      </td>
                      <td>{traslado.observacion || '-'}</td>
                      <td>
                        <div className="traslados-acciones">
                          {mostrarEnTransito && (
                            <button
                              className="btn btn-secondary btn-sm"
                              disabled={bloqueado}
                              onClick={() => ejecutarAccion(traslado.id, marcarTrasladoEnTransito)}
                            >
                              Marcar en tránsito
                            </button>
                          )}
                          {mostrarRecibido && (
                            <button
                              className="btn btn-success btn-sm"
                              disabled={bloqueado}
                              onClick={() => ejecutarAccion(traslado.id, marcarTrasladoRecibido)}
                            >
                              Marcar recibido
                            </button>
                          )}
                          {mostrarCancelar && (
                            <button
                              className="btn btn-danger btn-sm"
                              disabled={bloqueado}
                              onClick={() => ejecutarAccion(traslado.id, cancelarTrasladoInventario)}
                            >
                              Cancelar
                            </button>
                          )}
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
