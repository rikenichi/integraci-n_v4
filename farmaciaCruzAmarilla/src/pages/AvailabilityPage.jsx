import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerCatalogo } from '../services/medistockApi'
import { useApi } from '../hooks/useApi'
import { extraerLista, normalizarProducto } from '../utils/format'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import './AvailabilityPage.css'

export default function AvailabilityPage() {
  const { data, cargando, error } = useApi(obtenerCatalogo)
  const productos = useMemo(() => extraerLista(data).map(normalizarProducto), [data])

  const [filtro, setFiltro] = useState('')
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState('todas')

  const sucursales = useMemo(() => {
    const mapa = new Map()
    productos.forEach((p) => {
      p.stock_por_sucursal?.forEach((s) => {
        const key = s.sucursal
        if (!mapa.has(key)) {
          mapa.set(key, { sucursal: s.sucursal, ciudad: s.ciudad, productos: 0, unidades: 0 })
        }
        const entry = mapa.get(key)
        entry.productos += s.disponible > 0 ? 1 : 0
        entry.unidades += s.disponible
      })
    })
    return Array.from(mapa.values()).sort((a, b) => b.unidades - a.unidades)
  }, [productos])

  const filtrados = useMemo(() => {
    const q = filtro.trim().toLowerCase()
    return productos
      .map((p) => {
        const stockEnSucursal =
          sucursalSeleccionada === 'todas'
            ? p.stock_total
            : (p.stock_por_sucursal.find((s) => s.sucursal === sucursalSeleccionada)?.disponible || 0)
        return { ...p, stockMostrado: stockEnSucursal }
      })
      .filter((p) => p.stockMostrado > 0)
      .filter((p) => {
        if (!q) return true
        return `${p.nombre} ${p.codigo} ${p.marca} ${p.categoria}`.toLowerCase().includes(q)
      })
      .sort((a, b) => b.stockMostrado - a.stockMostrado)
      .slice(0, 60)
  }, [productos, filtro, sucursalSeleccionada])

  if (cargando) return <div className="page container"><Spinner /></div>
  if (error) {
    return (
      <div className="page container">
        <div className="alert alert-error">
          No pudimos consultar el inventario de MEDISTOCK en este momento.
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Disponibilidad por sucursal</h1>
            <p className="text-muted">
              Consulta el stock en vivo de los centros de distribución de MEDISTOCK.
              Útil para evaluar dónde retirar o desde qué sucursal te conviene despachar.
            </p>
          </div>
        </div>

        <section className="availability-summary">
          {sucursales.map((s) => (
            <button
              key={s.sucursal}
              type="button"
              className={`availability-card ${sucursalSeleccionada === s.sucursal ? 'active' : ''}`}
              onClick={() =>
                setSucursalSeleccionada((prev) => (prev === s.sucursal ? 'todas' : s.sucursal))
              }
            >
              <strong>{s.sucursal}</strong>
              <small>{s.ciudad || 'Sin ciudad'}</small>
              <div className="availability-card-stats">
                <span>
                  <em>{s.productos}</em>
                  <small>productos</small>
                </span>
                <span>
                  <em>{s.unidades}</em>
                  <small>unidades</small>
                </span>
              </div>
            </button>
          ))}
        </section>

        <div className="availability-filtros card">
          <div className="field" style={{ marginBottom: 0, flex: 1 }}>
            <label htmlFor="filtro">Buscar producto</label>
            <input
              id="filtro"
              type="search"
              placeholder="Nombre, código, marca o categoría…"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
          <div>
            <span className="text-muted small">Filtro activo:</span>{' '}
            <Badge variant={sucursalSeleccionada === 'todas' ? 'neutral' : 'primary'}>
              {sucursalSeleccionada === 'todas' ? 'Todas las sucursales' : sucursalSeleccionada}
            </Badge>
          </div>
        </div>

        {filtrados.length === 0 ? (
          <EmptyState
            icon="📭"
            titulo="Sin resultados"
            descripcion="No encontramos productos disponibles con esos criterios."
          />
        ) : (
          <div className="card availability-table-card">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio ref.</th>
                  <th>
                    {sucursalSeleccionada === 'todas' ? 'Stock total' : `Stock en ${sucursalSeleccionada}`}
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link to={`/producto/${p.id}`} className="availability-link">
                        <strong>{p.nombre}</strong>
                        <small className="text-muted">Cód. {p.codigo}</small>
                      </Link>
                    </td>
                    <td>{p.categoria || '-'}</td>
                    <td>{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(p.precio)}</td>
                    <td>
                      <Badge variant={p.stockMostrado < 10 ? 'warning' : 'success'}>
                        {p.stockMostrado} unidades
                      </Badge>
                    </td>
                    <td>
                      <Link to={`/producto/${p.id}`} className="btn btn-ghost btn-sm">Ver →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
