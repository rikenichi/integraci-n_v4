import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { obtenerCatalogo, obtenerProductoPublico } from '../services/medistockApi'
import { useApi } from '../hooks/useApi'
import { extraerLista, formatPrecio, normalizarProducto, urlCotizacion } from '../utils/format'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import './ProductDetailPage.css'

export default function ProductDetailPage() {
  const { codigo } = useParams() // realmente es el id

  // El catálogo trae stock_por_sucursal en vivo (el endpoint público individual no).
  const { data: catalogoData, cargando: cargandoCatalogo } = useApi(obtenerCatalogo)
  const { data: detalleData, cargando: cargandoDetalle, error } = useApi(
    () => obtenerProductoPublico(codigo),
    [codigo],
  )

  const cargando = cargandoCatalogo || cargandoDetalle

  const producto = useMemo(() => {
    if (!detalleData) return null
    const desdeDetalle = normalizarProducto(detalleData)
    // Enriquecer con stock por sucursal desde el catálogo
    const desdeCatalogo = extraerLista(catalogoData).find((p) => Number(p.id) === Number(codigo))
    if (desdeCatalogo) {
      const conStock = normalizarProducto({ ...desdeDetalle, stock_por_sucursal: desdeCatalogo.stock_por_sucursal })
      return { ...desdeDetalle, stock_por_sucursal: conStock.stock_por_sucursal, stock_total: conStock.stock_total }
    }
    return desdeDetalle
  }, [detalleData, catalogoData, codigo])

  if (cargando) return <div className="page container"><Spinner /></div>
  if (error || !producto) {
    return (
      <div className="page container">
        <div className="alert alert-error">No encontramos este producto.</div>
        <Link to="/catalogo" className="btn btn-ghost">← Volver al catálogo</Link>
      </div>
    )
  }

  const sinStock = producto.stock_total <= 0
  const sucursales = producto.stock_por_sucursal || []

  return (
    <div className="page">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Inicio</Link> /{' '}
          <Link to="/catalogo">Catálogo</Link> /{' '}
          {producto.categoria && (
            <>
              <Link to={`/catalogo?categoria=${encodeURIComponent(producto.categoria)}`}>
                {producto.categoria}
              </Link>{' '}
              /{' '}
            </>
          )}
          <span>{producto.nombre}</span>
        </nav>

        <div className="product-detail">
          <div className="product-detail-media">
            {producto.imagen ? (
              <img src={producto.imagen} alt={producto.nombre} />
            ) : (
              <span className="product-detail-placeholder">
                {producto.nombre.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="product-detail-info">
            {producto.categoria && <span className="text-muted small">{producto.categoria}</span>}
            <h1>{producto.nombre}</h1>
            {producto.marca && <p className="text-muted">{producto.marca}</p>}

            <div className="product-detail-badges">
              {producto.requiere_receta && <Badge variant="info">Requiere receta</Badge>}
              {sinStock ? (
                <Badge variant="danger">Sin stock</Badge>
              ) : (
                <Badge variant="success">
                  Disponible · {producto.stock_total} unidades en red MEDISTOCK
                </Badge>
              )}
              <Badge variant="neutral">Cód. {producto.codigo}</Badge>
            </div>

            <div className="product-detail-price">
              <strong>{formatPrecio(producto.precio)}</strong>
              <small>por {producto.unidad} · referencial, IVA incluido</small>
            </div>

            {producto.descripcion && (
              <div className="product-detail-desc">
                <h3>Descripción</h3>
                <p>{producto.descripcion}</p>
              </div>
            )}

            <div className="product-detail-cta">
              <a href={urlCotizacion(producto)} className="btn btn-primary btn-lg">
                ✉️ Solicitar cotización
              </a>
              <a href="tel:+56222221111" className="btn btn-ghost btn-lg">
                📞 Llamar a ventas
              </a>
            </div>

            <p className="text-muted small product-detail-disclaimer">
              Precios y stock provienen del API público de MEDISTOCK.
              Para compras institucionales, solicitamos cotización formal con descuento por volumen.
            </p>
          </div>
        </div>

        <section className="card product-stock-card">
          <header className="product-stock-head">
            <div>
              <h2>Disponibilidad por sucursal</h2>
              <p className="text-muted">
                Inventario consultado en vivo desde la red de centros de distribución MEDISTOCK.
              </p>
            </div>
            <Badge variant={sinStock ? 'danger' : 'success'}>
              {producto.stock_total} unidades en total
            </Badge>
          </header>

          {sucursales.length === 0 ? (
            <p className="text-muted text-center" style={{ padding: 24 }}>
              No hay información de stock por sucursal para este producto.
            </p>
          ) : (
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Sucursal</th>
                  <th>Ciudad</th>
                  <th>Disponible</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {sucursales.map((s, i) => (
                  <tr key={`${s.sucursal_id || s.sucursal}-${i}`}>
                    <td><strong>{s.sucursal}</strong></td>
                    <td>{s.ciudad || '—'}</td>
                    <td>{s.disponible}</td>
                    <td>
                      {s.disponible <= 0 ? (
                        <Badge variant="danger">Sin stock</Badge>
                      ) : s.disponible < 10 ? (
                        <Badge variant="warning">Bajo</Badge>
                      ) : (
                        <Badge variant="success">OK</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  )
}
