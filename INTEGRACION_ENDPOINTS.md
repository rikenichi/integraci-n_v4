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
| Traslados de inventario | `/api/inventory/traslados/` para listado |
| Resumen de inventario del panel | `/api/inventory/inventarios/`, `/api/inventory/lotes/`, `/api/inventory/movimientos/` |

## Funciones frontend alineadas en etapa 2

En `medistockFrontEnd/src/services/api.js` se quitaron llamadas HTTP a rutas no
montadas cuando no habia un endpoint real equivalente. El criterio aplicado fue:
usar endpoint real si existe; si no existe, responder desde un demo controlado
para que la pantalla no falle por 404.

| Funcion frontend | Estado actual |
| --- | --- |
| `obtenerTrasladosInventario` | Conectada a `/api/inventory/traslados/`; pantalla en modo consulta real |
| `obtenerResumenInventario` | Compuesta desde endpoints reales de inventario |
| `simularPago` | Demo local controlado; Webpay real sigue en `/api/payments/webpay/iniciar/` |
| `obtenerProveedores`, `obtenerOrdenesCompra` | Demo controlado |
| `obtenerIntegracionesExternas`, `obtenerRegistrosIntegracion`, `obtenerAuditoriaEventos` | Demo controlado |
| `obtenerConveniosInstitucionales` | Demo controlado |
| `obtenerAprobacionesB2B` | Conectada a `/api/orders/pedidos/todos/`; normaliza pedidos reales como bandeja B2B |
| `aprobarRevisionB2B`, `rechazarRevisionB2B` | Conectadas a `/api/orders/pedidos/<id>/aprobar/` |
| `observarRevisionB2B` | Demo local no persistente; no existe accion equivalente en backend |
| `obtenerConciliacionesPago` | Conectada a `/api/payments/mis-pagos/`; normaliza pagos reales para revision financiera |
| `actualizarConciliacionPago` | Demo local no persistente; no existe URL backend para persistir conciliacion |
| `obtenerDocumentosTributarios`, `generarDteDesdePedido`, detalle DTE | Demo controlado |
| `getDespachos` | Demo vacio controlado; no existe listado de despachos montado |
| `GuiasDespachoPage` | Pendiente backend; no muestra guias simuladas |
| `generarTracking`, `generarCourier`, `getCourierTracking` | Demo controlado |

## Endpoints backend pendientes

| Area | Endpoints frontend |
| --- | --- |
| Convenios institucionales | URL backend para listar convenios de `accounts.ConvenioInstitucion` |
| Acciones de traslados | Endpoints o contrato PATCH para transicion de estados |
| Compras proveedor | URLs para `procurement.Proveedor` y `procurement.CompraProveedor` |
| Integraciones | URLs para `integrations.IntegracionExterna` y `integrations.RegistroIntegracion` |
| Auditoria | Modelo/API de auditoria si se mantiene esa pantalla |
| Aprobaciones B2B | URL separada si se requiere una bandeja distinta a `/api/orders/pedidos/<id>/aprobar/` |
| Pago simulado | Endpoint backend solo si se quiere persistir pagos demo |
| Conciliacion de pagos | URL financiera si se requiere persistencia de conciliaciones |
| DTE y guias | URLs para `billing.DocumentoTributario` y `billing.GuiaDespacho` |
| Despachos | URL de listado/detalle para `logistics.Despacho` |
| Creacion simple de tracking | Contrato separado o payload completo para crear OT Chilexpress |
| Tracking courier directo | URL si se desea consultar por numero de tracking en vez de por pedido |

## Estado de pantallas demo o parciales

- `ResultadoPagoPage` separa Webpay real de metodos de pago simulados; el demo
  ya no llama a una ruta backend inexistente.
- `ComprobanteDtePage` presenta un comprobante tributario simulado con datos
  retornados por el servicio frontend.
- `GuiasDespachoPage` queda como modulo pendiente y no muestra fixtures, porque
  no existe endpoint real de listado/gestion de guias de despacho.
- Compras proveedor, integraciones, convenios institucionales y parte del panel
  administrativo quedan como demo explicito hasta que se expongan URLs backend.
- Aprobaciones B2B usa pedidos reales y persiste aprobar/rechazar; observar
  sigue local porque no hay endpoint equivalente.
- Conciliacion de pagos usa pagos reales desde `/api/payments/mis-pagos/`; los
  cambios de estado de conciliacion siguen locales porque no hay endpoint
  financiero de conciliacion montado.

## Proximos puntos de integracion

1. Mantener el transporte local consistente con proxy Vite o CORS Django.
2. Alinear cada cliente pendiente de `api.js` con endpoint real o mock explicito.
3. Revisar autenticacion, roles y permisos en una etapa separada.
