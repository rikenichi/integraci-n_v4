import axios from 'axios'

// Cliente axios apuntando al backend de MEDISTOCK.
// Este sitio es un CONSUMIDOR READ-ONLY del API público de MEDISTOCK,
// pensado como vitrina para que profesionales de salud consulten catálogo y stock
// del distribuidor antes de solicitar una cotización.
//
// En dev VITE_MEDISTOCK_API=/api → Vite proxy → http://localhost:8000
// En prod definir VITE_MEDISTOCK_API=https://api-medistock-en-aws.cl/api
const BASE = import.meta.env.VITE_MEDISTOCK_API || '/api'

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
})

// ============================================================
// CATÁLOGO PÚBLICO (sin auth)
// ============================================================
export const obtenerCatalogo = () => api.get('/inventory/catalogo/')
export const obtenerCategorias = () => api.get('/inventory/public/categorias/')
export const obtenerProductoPublico = (codigo) =>
  api.get(`/inventory/public/productos/${codigo}/`)

export default api
