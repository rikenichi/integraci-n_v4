import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { obtenerCatalogo } from '../services/medistockApi'
import { useApi } from '../hooks/useApi'
import { extraerLista, normalizarProducto } from '../utils/format'
import ProductCard from '../components/ProductCard'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import './CatalogPage.css'

const ORDENES = [
  { id: 'relevancia', label: 'Más relevantes' },
  { id: 'precio_asc', label: 'Precio: menor a mayor' },
  { id: 'precio_desc', label: 'Precio: mayor a menor' },
  { id: 'nombre', label: 'Nombre A → Z' },
]

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data, error, cargando } = useApi(obtenerCatalogo)
  const productos = useMemo(() => extraerLista(data).map(normalizarProducto), [data])

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [categoria, setCategoria] = useState(searchParams.get('categoria') || '')
  const [orden, setOrden] = useState('relevancia')
  const [soloDisponible, setSoloDisponible] = useState(false)

  // Sincroniza la URL con los filtros (debounce simple)
  useEffect(() => {
    const t = setTimeout(() => {
      const params = {}
      if (search) params.search = search
      if (categoria) params.categoria = categoria
      setSearchParams(params, { replace: true })
    }, 250)
    return () => clearTimeout(t)
  }, [search, categoria, setSearchParams])

  const categorias = useMemo(() => {
    const set = new Set()
    productos.forEach((p) => p.categoria && set.add(p.categoria))
    return Array.from(set).sort()
  }, [productos])

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase()
    let lista = productos.filter((p) => {
      if (categoria && p.categoria !== categoria) return false
      if (soloDisponible && p.stock_total <= 0) return false
      if (q) {
        const haystack = `${p.nombre} ${p.codigo} ${p.marca} ${p.descripcion}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })

    switch (orden) {
      case 'precio_asc':
        lista = [...lista].sort((a, b) => a.precio - b.precio)
        break
      case 'precio_desc':
        lista = [...lista].sort((a, b) => b.precio - a.precio)
        break
      case 'nombre':
        lista = [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
        break
      default:
        break
    }
    return lista
  }, [productos, search, categoria, soloDisponible, orden])

  const limpiar = () => {
    setSearch('')
    setCategoria('')
    setSoloDisponible(false)
    setOrden('relevancia')
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Catálogo</h1>
            <p className="text-muted">
              {cargando
                ? 'Consultando catálogo MEDISTOCK…'
                : `${filtrados.length} producto${filtrados.length === 1 ? '' : 's'} disponibles`}
            </p>
          </div>
        </div>

        <div className="catalog-layout">
          <aside className="catalog-filters card">
            <div className="field">
              <label htmlFor="search">Buscar</label>
              <input
                id="search"
                type="search"
                placeholder="Producto, marca o código…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Categoría</label>
              <div className="filter-chips">
                <button
                  type="button"
                  className={`chip ${!categoria ? 'chip-active' : ''}`}
                  onClick={() => setCategoria('')}
                >
                  Todas
                </button>
                {categorias.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`chip ${categoria === c ? 'chip-active' : ''}`}
                    onClick={() => setCategoria(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Ordenar por</label>
              <select value={orden} onChange={(e) => setOrden(e.target.value)}>
                {ORDENES.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </div>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={soloDisponible}
                onChange={(e) => setSoloDisponible(e.target.checked)}
              />
              <span>Solo con stock</span>
            </label>

            <Button variant="ghost" block onClick={limpiar}>Limpiar filtros</Button>
          </aside>

          <div className="catalog-main">
            {cargando && <Spinner />}
            {error && (
              <div className="alert alert-error">
                No pudimos cargar el catálogo. Intenta refrescar la página.
              </div>
            )}
            {!cargando && !error && filtrados.length === 0 && (
              <EmptyState
                icon="🔍"
                titulo="Sin resultados"
                descripcion="No encontramos productos que coincidan con tu búsqueda."
                accion={<Button variant="primary" onClick={limpiar}>Limpiar filtros</Button>}
              />
            )}
            {!cargando && !error && filtrados.length > 0 && (
              <div className="catalog-grid">
                {filtrados.map((p) => (
                  <ProductCard key={p.id} producto={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
