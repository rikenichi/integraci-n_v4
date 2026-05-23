import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  anularGuiaDespacho,
  marcarGuiaEnTransito,
  marcarGuiaEntregada,
  obtenerGuiasDespacho,
} from '../services/api'
import './GuiasDespachoPage.css'

const ROLES_INTERNOS = ['admin', 'operador', 'analista']

const ESTADOS = {
  emitida: { label: 'Emitida', clase: 'badge-info' },
  en_transito: { label: 'En tránsito', clase: 'badge-warning' },
  entregada: { label: 'Entregada', clase: 'badge-success' },
  anulada: { label: 'Anulada', clase: 'badge-danger' },
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

function obtenerLista(data) {
  return data?.results || data || []
}

function getEstado(estado) {
  return ESTADOS[estado] || { label: estado || 'Sin estado', clase: 'badge-secondary' }
}

export default function GuiasDespachoPage() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [guias, setGuias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accionandoId, setAccionandoId] = useState(null)

  const autorizado = ROLES_INTERNOS.includes(usuario?.rol)

  const cargarDatos = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await obtenerGuiasDespacho()
      setGuias(obtenerLista(data))
    } catch (e) {
      setError(e.response?.data?.detail || 'No se pudieron cargar las guías de despacho.')
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
      setError(e.response?.data?.error || e.response?.data?.detail || 'No se pudo actualizar la guía.')
    } finally {
      setAccionandoId(null)
    }
  }

  if (!autorizado) {
    return (
      <div className="page-container guias-page">
        <div className="guias-toolbar">
          <button className="btn btn-secondary" onClick={() => navigate('/panel')}>
            Ir al panel
          </button>
        </div>
        <div className="card guias-acceso">
          <h1>Acceso no autorizado</h1>
          <p className="text-muted">
            Esta vista está disponible solo para roles internos de logística y análisis.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container guias-page">
      <div className="guias-header">
        <div>
          <p className="guias-kicker">Despacho administrativo</p>
          <h1 className="page-title">Guías de despacho <span className="demo-chip">Demo</span></h1>
          <p className="text-muted">
            Documentos simulados para trazabilidad documental, separados del tracking operativo real.
          </p>
        </div>
        <div className="guias-toolbar">
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
          <div className="guias-section-header">
            <h2>Guías registradas</h2>
            <span>{guias.length} documentos</span>
          </div>
          {guias.length === 0 ? (
            <p className="text-muted guias-empty">No hay guías de despacho registradas.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Guía</th>
                  <th>Pedido</th>
                  <th>Despacho</th>
                  <th>Emisión</th>
                  <th>Motivo</th>
                  <th>Transportista</th>
                  <th>Patente</th>
                  <th>Origen</th>
                  <th>Destino</th>
                  <th>Estado</th>
                  <th>Observación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {guias.map(guia => {
                  const estado = getEstado(guia.estado)
                  const bloqueado = accionandoId === guia.id
                  const mostrarEnTransito = guia.estado === 'emitida'
                  const mostrarEntregada = guia.estado === 'en_transito'
                  const mostrarAnular = !['entregada', 'anulada'].includes(guia.estado)

                  return (
                    <tr key={guia.id}>
                      <td><strong>{guia.numero_guia}</strong></td>
                      <td>#{guia.pedido_numero || guia.pedido}</td>
                      <td>{guia.despacho_tracking || '-'}</td>
                      <td>{formatFecha(guia.fecha_emision)}</td>
                      <td>{guia.motivo_traslado || '-'}</td>
                      <td>{guia.transportista || '-'}</td>
                      <td>{guia.patente_vehiculo || '-'}</td>
                      <td>{guia.direccion_origen || '-'}</td>
                      <td>{guia.direccion_destino || '-'}</td>
                      <td><span className={`badge ${estado.clase}`}>{estado.label}</span></td>
                      <td>{guia.observacion || '-'}</td>
                      <td>
                        <div className="guias-acciones">
                          {mostrarEnTransito && (
                            <button
                              className="btn btn-secondary btn-sm"
                              disabled={bloqueado}
                              onClick={() => ejecutarAccion(guia.id, marcarGuiaEnTransito)}
                            >
                              Marcar en tránsito
                            </button>
                          )}
                          {mostrarEntregada && (
                            <button
                              className="btn btn-success btn-sm"
                              disabled={bloqueado}
                              onClick={() => ejecutarAccion(guia.id, marcarGuiaEntregada)}
                            >
                              Marcar entregada
                            </button>
                          )}
                          {mostrarAnular && (
                            <button
                              className="btn btn-danger btn-sm"
                              disabled={bloqueado}
                              onClick={() => ejecutarAccion(guia.id, anularGuiaDespacho)}
                            >
                              Anular
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
