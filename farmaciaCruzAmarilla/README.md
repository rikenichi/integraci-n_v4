# Farmacia Cruz Amarilla

Vitrina B2B **read-only** que actúa como cliente externo del API público de MEDISTOCK.
No realiza transacciones: muestra catálogo, precios y stock en tiempo real, y
canaliza solicitudes de cotización vía email a la sucursal correspondiente.

Objetivo: demostrar que el API REST de MEDISTOCK es reutilizable por terceros
(p. ej. una farmacia comunal, un sitio comparador, una integradora clínica).

## Stack
- Vite + React 18
- React Router v6
- Axios (sin auth, solo lectura)
- CSS plano con variables (sin frameworks)

## Endpoints consumidos del API MEDISTOCK
| Endpoint | Página |
|---|---|
| `GET /inventory/catalogo/` | Home, Catálogo, Disponibilidad |
| `GET /inventory/public/categorias/` | Filtros (opcional) |
| `GET /inventory/public/productos/:codigo/` | Detalle de producto |

> No se consumen endpoints autenticados, no se crean pedidos ni se manejan pagos.
> Las cotizaciones se gestionan por email (`mailto:`) fuera del sistema.

## Páginas
- `/` — Hero + categorías frecuentes + productos destacados
- `/catalogo` — Listado con búsqueda, categorías, "solo con stock", ordenamiento
- `/producto/:codigo` — Ficha + tabla de **stock por sucursal** + CTA cotización
- `/disponibilidad` — Inventario por sucursal de toda la red MEDISTOCK
- `/sobre-nosotros` — Convenios B2B y modelo de integración

## Cómo correr
```bash
npm install
npm run dev
```
Abre http://localhost:5174 (puerto distinto al frontend interno de MEDISTOCK).

## Variables de entorno
Definidas en `.env.development`:
- `VITE_MEDISTOCK_API=/api` → en dev, pasa por el proxy de Vite hacia `http://localhost:8000`.

En producción, sobreescribir con la URL pública del backend en AWS:
```
VITE_MEDISTOCK_API=https://api-medistock.example.com/api
```
