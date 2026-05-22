# Integracion de endpoints MEDISTOCK

Este mapa resume la superficie de integracion detectada entre el frontend React
y el backend Django al inicio de la etapa de ordenamiento. La raiz Django no
expone una vista de inicio; las rutas utiles estan bajo `/api/` y `/admin/`.

## Base de comunicacion

- El frontend centraliza las llamadas HTTP en
  `medistockFrontEnd/src/services/api.js`.
- Para desarrollo con Vite se recomienda `VITE_API_URL=/api`, que usa el proxy
  definido en `medistockFrontEnd/vite.config.js`.
- Si `VITE_API_URL` no esta definido, el cliente mantiene el fallback directo
  `http://localhost:8000/api`.

## Endpoints reales detectados en backend

### Autenticacion y cuentas

| Metodo | Endpoint |
| --- | --- |
| POST | `/api/token/` |
| POST | `/api/token/refresh/` |
| POST | `/api/accounts/login/` |
| POST | `/api/accounts/login/refresh/` |
| POST | `/api/accounts/logout/` |
| GET, PATCH | `/api/accounts/perfil/me/` |
| POST | `/api/accounts/registro/cliente/` |
| POST | `/api/accounts/registro/trabajador/` |
| CRUD | `/api/accounts/trabajadores/` |
| CRUD | `/api/accounts/clientes/` |
| CRUD | `/api/accounts/mis-direcciones/` |

### Inventario y catalogo

| Metodo | Endpoint |
| --- | --- |
| GET, POST | `/api/inventory/categorias/` |
| GET | `/api/inventory/public/categorias/` |
| GET, POST | `/api/inventory/marcas/` |
| GET | `/api/inventory/public/marcas/` |
| GET, POST | `/api/inventory/productos/` |
| GET | `/api/inventory/public/productos/<pk>/` |
| GET, POST | `/api/inventory/lotes/` |
| GET, POST | `/api/inventory/inventarios/` |
| GET, POST | `/api/inventory/movimientos/` |
| GET, POST | `/api/inventory/traslados/` |
| GET | `/api/inventory/catalogo/` |
| GET | `/api/inventory/catalogo-cajas/` |

### Pedidos

| Metodo | Endpoint |
| --- | --- |
| POST | `/api/orders/pedidos/` |
| GET | `/api/orders/pedidos/mis-pedidos/` |
| GET | `/api/orders/pedidos/todos/` |
| GET, PATCH | `/api/orders/pedidos/<pedido_id>/` |
| POST | `/api/orders/pedidos/<pedido_id>/aprobar/` |

### Pagos Webpay

| Metodo | Endpoint |
| --- | --- |
| POST | `/api/payments/webpay/iniciar/` |
| GET, POST | `/api/payments/webpay/commit/` |
| GET | `/api/payments/webpay/estado/<token_ws>/` |
| GET | `/api/payments/mis-pagos/` |

### Logistica y ubicaciones

| Metodo | Endpoint |
| --- | --- |
| POST | `/api/logistics/cotizar/` |
| POST | `/api/logistics/envios/` |
| GET | `/api/logistics/envios/<pedido_id>/tracking/` |
| GET | `/api/locations/regions/` |
| GET | `/api/locations/regions-with-comunas/` |
| GET | `/api/locations/comunas/` |
| GET | `/api/locations/comunas-chilexpress/` |
| GET | `/api/locations/sucursales/<pk>/` |

## Frontend que usa endpoints reales

| Pantalla o flujo | Endpoints principales |
| --- | --- |
| Inicio y catalogo | `/api/inventory/catalogo/`, `/api/inventory/public/categorias/` |
| Detalle de producto | `/api/inventory/public/productos/<pk>/`, fallback al catalogo |
| Registro y perfil | `/api/accounts/registro/cliente/`, `/api/accounts/perfil/me/`, ubicaciones |
| Carrito y confirmacion | direcciones, sucursales, `/api/logistics/cotizar/`, `/api/orders/pedidos/` |
| Pedidos | `/api/orders/pedidos/mis-pedidos/`, `/api/orders/pedidos/todos/`, detalle |
| Pago Webpay | `/api/payments/webpay/iniciar/`, commit y estado |
| Pagos del cliente | `/api/payments/mis-pagos/` |
| Tracking | `/api/logistics/envios/<pedido_id>/tracking/` |

## Endpoints usados por frontend que siguen pendientes o demo

Las siguientes rutas aparecen en `src/services/api.js`, pero no se detectaron
montadas en las URL del backend actual:

| Area | Endpoints frontend |
| --- | --- |
| Convenios | `/api/usuarios/convenios/` |
| Resumen inventario | `/api/stock/resumen-inventario/` |
| Traslados UI | `/api/stock/traslados/` y acciones por traslado |
| Compras proveedor | `/api/compras/proveedores/`, `/api/compras/ordenes/` |
| Integraciones | `/api/integraciones/integraciones/`, `/api/integraciones/registros/`, `/api/integraciones/auditoria/` |
| Aprobaciones B2B | `/api/pedidos/aprobaciones/` y acciones |
| Pago simulado y conciliacion | `/api/pagos/simular/`, `/api/pagos/conciliaciones/` |
| DTE demo | `/api/dte/documentos/` y generacion desde pedido |
| Despachos y guias | `/api/logistics/despachos/`, `/api/logistics/guias/` |
| Courier experimental | `/api/logistics/courier-tracking/<tracking>/` |

## Estado de pantallas demo o parciales

- `ResultadoPagoPage` separa Webpay real de metodos de pago simulados.
- `ComprobanteDtePage` presenta un comprobante tributario simulado.
- `GuiasDespachoPage` presenta documentacion de despacho simulada.
- Compras proveedor, integraciones, conciliacion, convenios institucionales,
  aprobaciones B2B y parte del panel administrativo dependen de endpoints
  pendientes o de una futura separacion explicita de mocks.

## Proximos puntos de integracion

1. Mantener el transporte local consistente con proxy Vite o CORS Django.
2. Alinear cada cliente pendiente de `api.js` con endpoint real o mock explicito.
3. Revisar autenticacion, roles y permisos en una etapa separada.
