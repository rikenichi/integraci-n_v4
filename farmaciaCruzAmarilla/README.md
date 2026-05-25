# Farmacia Cruz Amarilla

Portal B2B/B2C de demostración que opera como **cliente externo** del API REST de MEDISTOCK.
Construido para mostrar que el ecosistema MEDISTOCK es reutilizable por terceros.

## Stack
- Vite + React 18
- React Router v6
- Axios (con refresh token automático)
- CSS plano + variables (sin frameworks)

## Endpoints consumidos del API MEDISTOCK
| Endpoint | Uso |
|---|---|
| `GET /inventory/catalogo/` | Catálogo + Home |
| `GET /inventory/public/categorias/` | Filtros de categoría |
| `GET /inventory/public/productos/:codigo/` | Detalle de producto |
| `POST /accounts/login/` + `POST /accounts/login/refresh/` | Auth JWT |
| `GET /accounts/perfil/me/` | Perfil de usuario logueado |
| `POST /orders/pedidos/` | Crear pedido desde checkout |
| `GET /orders/pedidos/mis-pedidos/` | Historial del usuario |

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
