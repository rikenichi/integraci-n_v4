import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  crearProducto,
  listarCategoriasAdmin,
  listarMarcasAdmin,
  listarProductosAdmin,
} from '../../services/api'
import './AdminProductosPage.css'

const ROLES_PERMITIDOS = ['admin', 'operador', 'analista']

const FORM_INICIAL = {
  sku: '',
  nombre: '',
  descripcion: '',
  valor_unitario: '',
  marca_id: '',
  categoria_referencia: '',
  unidad_medida: 'unidad',
  largo_mm: '',
  ancho_mm: '',
  alto_mm: '',
  peso_mg: '',
  volumen_ml: '',
  registro_sanitario: '',
  requiere_control_vencimiento: true,
  activo: true,
  es_caja: false,
}

function obtenerLista(data) {
  return data?.results || data || []
}

function formatPrecio(valor) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(Number(valor || 0))
}

function extraerMensajeError(data) {
  if (!data) return ''
  if (typeof data === 'string') return data
  if (Array.isArray(data)) return data.map(extraerMensajeError).filter(Boolean).join(' ')

  const partes = Object.entries(data).map(([campo, valor]) => {
    const mensaje = extraerMensajeError(valor)
    return mensaje ? `${campo}: ${mensaje}` : ''
  })

  return partes.filter(Boolean).join(' ')
}

function mensajeErrorApi(error, fallback) {
  if (!error.response) return 'No fue posible conectar con el backend.'
  if (error.response.status === 403) return 'No tienes permisos para consultar esta información.'
  if (error.response.status === 404) return 'No se encontró información asociada.'
  if (error.response.status === 409) return extraerMensajeError(error.response.data) || fallback
  if (error.response.status === 500) return 'Error del servidor. Intenta nuevamente.'
  return extraerMensajeError(error.response.data) || fallback
}

function numeroOpcional(valor) {
  if (valor === '' || valor === null || valor === undefined) return 0
  return Number(valor)
}

function normalizarProducto(producto = {}) {
  return {
    ...producto,
    sku: producto.sku || '-',
    marca_nombre: producto.marca?.nombre || producto.marca_nombre || '-',
    categorias_texto: (producto.categorias || [])
      .map((item) => item.categoria?.nombre || item.nombre)
      .filter(Boolean)
      .join(', '),
  }
}

export default function AdminProductosPage() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])
  const [form, setForm] = useState(FORM_INICIAL)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [erroresForm, setErroresForm] = useState({})

  const rol = String(usuario?.rol || '').toLowerCase()
  const autorizado = ROLES_PERMITIDOS.includes(rol)

  const productosNormalizados = useMemo(
    () => productos.map(normalizarProducto),
    [productos],
  )

  const cargarDatos = async () => {
    setLoading(true)
    setError('')
    try {
      const [productosR, categoriasR, marcasR] = await Promise.all([
        listarProductosAdmin(),
        listarCategoriasAdmin(),
        listarMarcasAdmin(),
      ])
      setProductos(obtenerLista(productosR.data))
      setCategorias(obtenerLista(categoriasR.data))
      setMarcas(obtenerLista(marcasR.data))
    } catch (err) {
      setError(mensajeErrorApi(err, 'No se pudieron cargar los datos de productos.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autorizado) cargarDatos()
  }, [autorizado])

  const setCampo = (campo, valor) => {
    setForm((actual) => ({ ...actual, [campo]: valor }))
    if (erroresForm[campo]) {
      setErroresForm((actual) => ({ ...actual, [campo]: '' }))
    }
    if (error) setError('')
    if (exito) setExito('')
  }

  const validar = () => {
    const errores = {}
    if (!form.sku.trim()) errores.sku = 'El SKU es obligatorio.'
    if (!form.nombre.trim()) errores.nombre = 'El nombre es obligatorio.'
    if (form.valor_unitario === '' || Number(form.valor_unitario) < 0) {
      errores.valor_unitario = 'El valor unitario debe ser mayor o igual a 0.'
    }
    return errores
  }

  const construirPayload = () => ({
    sku: form.sku.trim(),
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim(),
    valor_unitario: Number(form.valor_unitario || 0),
    marca_id: form.marca_id ? Number(form.marca_id) : null,
    unidad_medida: form.unidad_medida.trim() || 'unidad',
    largo_mm: numeroOpcional(form.largo_mm),
    ancho_mm: numeroOpcional(form.ancho_mm),
    alto_mm: numeroOpcional(form.alto_mm),
    peso_mg: numeroOpcional(form.peso_mg),
    volumen_ml: numeroOpcional(form.volumen_ml),
    requiere_control_vencimiento: Boolean(form.requiere_control_vencimiento),
    registro_sanitario: form.registro_sanitario.trim(),
    activo: Boolean(form.activo),
    es_caja: Boolean(form.es_caja),
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setExito('')

    const errores = validar()
    setErroresForm(errores)
    if (Object.keys(errores).length > 0) return

    setGuardando(true)
    try {
      await crearProducto(construirPayload())
      setExito('Producto creado correctamente. Si no tiene stock, aparecerá como sin stock en catálogo.')
      setForm(FORM_INICIAL)
      setMostrarForm(false)
      await cargarDatos()
    } catch (err) {
      setError(mensajeErrorApi(err, 'No se pudo crear el producto. Revisa los campos obligatorios.'))
    } finally {
      setGuardando(false)
    }
  }

  if (!autorizado) {
    return (
      <div className="page-container admin-productos-page">
        <div className="admin-productos-toolbar">
          <button className="btn btn-secondary" onClick={() => navigate('/panel')}>
            Ir al panel
          </button>
        </div>
        <div className="card admin-productos-acceso">
          <h1>Acceso no autorizado</h1>
          <p className="text-muted">
            Esta vista esta disponible solo para roles internos autorizados.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container admin-productos-page">
      <div className="admin-productos-header">
        <div>
          <p className="admin-productos-kicker">Inventario administrativo</p>
          <h1 className="page-title">Gestión de productos</h1>
          <p className="text-muted">
            Crea productos usando el endpoint real de inventario. El stock se gestiona por lotes e inventarios.
          </p>
        </div>
        <div className="admin-productos-toolbar">
          <button className="btn btn-secondary" onClick={() => navigate('/panel')}>
            Ir al panel
          </button>
          <button className="btn btn-primary" onClick={() => setMostrarForm((valor) => !valor)}>
            {mostrarForm ? 'Cerrar formulario' : 'Nuevo producto'}
          </button>
          <button className="btn btn-secondary" onClick={cargarDatos} disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {exito && <div className="alert alert-success">{exito}</div>}

      {mostrarForm && (
        <section className="card admin-productos-form-card">
          <div className="admin-productos-section-header">
            <h2>Nuevo producto</h2>
            <span>Campos reales del serializer Producto</span>
          </div>
          <form className="admin-productos-form" onSubmit={handleSubmit}>
            <label>
              SKU *
              <input value={form.sku} onChange={(e) => setCampo('sku', e.target.value)} placeholder="MED-001" />
              {erroresForm.sku && <small>{erroresForm.sku}</small>}
            </label>
            <label>
              Nombre *
              <input value={form.nombre} onChange={(e) => setCampo('nombre', e.target.value)} placeholder="Guantes nitrilo" />
              {erroresForm.nombre && <small>{erroresForm.nombre}</small>}
            </label>
            <label>
              Valor unitario *
              <input type="number" min="0" value={form.valor_unitario} onChange={(e) => setCampo('valor_unitario', e.target.value)} />
              {erroresForm.valor_unitario && <small>{erroresForm.valor_unitario}</small>}
            </label>
            <label>
              Marca
              <select value={form.marca_id} onChange={(e) => setCampo('marca_id', e.target.value)}>
                <option value="">Sin marca</option>
                {marcas.map((marca) => (
                  <option key={marca.id} value={marca.id}>{marca.nombre}</option>
                ))}
              </select>
            </label>
            <label>
              Categoría de referencia
              <select value={form.categoria_referencia} onChange={(e) => setCampo('categoria_referencia', e.target.value)}>
                <option value="">Sin categoría asociada</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                ))}
              </select>
              <small>El serializer actual no acepta asignar categorías en el POST de producto.</small>
            </label>
            <label>
              Unidad de medida
              <input value={form.unidad_medida} onChange={(e) => setCampo('unidad_medida', e.target.value)} />
            </label>
            <label className="admin-productos-form-wide">
              Descripción
              <textarea rows="3" value={form.descripcion} onChange={(e) => setCampo('descripcion', e.target.value)} />
            </label>
            <label>
              Largo mm
              <input type="number" min="0" value={form.largo_mm} onChange={(e) => setCampo('largo_mm', e.target.value)} />
            </label>
            <label>
              Ancho mm
              <input type="number" min="0" value={form.ancho_mm} onChange={(e) => setCampo('ancho_mm', e.target.value)} />
            </label>
            <label>
              Alto mm
              <input type="number" min="0" value={form.alto_mm} onChange={(e) => setCampo('alto_mm', e.target.value)} />
            </label>
            <label>
              Peso mg
              <input type="number" min="0" value={form.peso_mg} onChange={(e) => setCampo('peso_mg', e.target.value)} />
            </label>
            <label>
              Volumen ml
              <input type="number" min="0" value={form.volumen_ml} onChange={(e) => setCampo('volumen_ml', e.target.value)} />
            </label>
            <label>
              Registro sanitario
              <input value={form.registro_sanitario} onChange={(e) => setCampo('registro_sanitario', e.target.value)} />
            </label>
            <div className="admin-productos-checks">
              <label>
                <input type="checkbox" checked={form.requiere_control_vencimiento} onChange={(e) => setCampo('requiere_control_vencimiento', e.target.checked)} />
                Control vencimiento
              </label>
              <label>
                <input type="checkbox" checked={form.activo} onChange={(e) => setCampo('activo', e.target.checked)} />
                Activo
              </label>
              <label>
                <input type="checkbox" checked={form.es_caja} onChange={(e) => setCampo('es_caja', e.target.checked)} />
                Es caja
              </label>
            </div>
            <div className="admin-productos-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setForm(FORM_INICIAL)}>
                Limpiar
              </button>
              <button type="submit" className="btn btn-primary" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Crear producto'}
              </button>
            </div>
          </form>
        </section>
      )}

      {loading ? (
        <div className="spinner" />
      ) : (
        <section className="tabla-container card">
          <div className="admin-productos-section-header">
            <h2>Productos existentes</h2>
            <span>{productosNormalizados.length} productos</span>
          </div>
          {productosNormalizados.length === 0 ? (
            <p className="text-muted admin-productos-empty">No hay productos registrados.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Nombre</th>
                  <th>Marca</th>
                  <th>Categorías</th>
                  <th>Precio</th>
                  <th>Unidad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {productosNormalizados.map((producto) => (
                  <tr key={producto.id}>
                    <td><span className="mono-value">{producto.sku}</span></td>
                    <td>
                      <strong>{producto.nombre}</strong>
                      {producto.descripcion && (
                        <>
                          <br />
                          <span className="text-muted">{producto.descripcion}</span>
                        </>
                      )}
                    </td>
                    <td>{producto.marca_nombre}</td>
                    <td>{producto.categorias_texto || '-'}</td>
                    <td>{formatPrecio(producto.valor_unitario)}</td>
                    <td>{producto.unidad_medida || '-'}</td>
                    <td>
                      <span className={`badge ${producto.activo ? 'badge-success' : 'badge-secondary'}`}>
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  )
}
