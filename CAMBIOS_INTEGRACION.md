# Cambios de Integracion Medistock

Registro de cambios relevantes realizados durante la etapa de integracion entre frontend, backend, base de datos y servicios externos/simulados.

Fecha de referencia: 2026-05-26

## Backend

- Se integro el endpoint `POST /api/inventory/ingresar-producto/`.
- El ingreso de producto permite crear o recuperar un producto por `sku`.
- Se agrego asociacion de categorias mediante `categoria_ids`.
- Se agrego creacion o recuperacion de lote por producto y `codigo_lote`.
- Se agrego creacion o actualizacion de inventario por lote y sucursal.
- Se suma `cantidad_disponible` al inventario existente cuando corresponde.
- Se registra movimiento de inventario tipo `ENTRADA`.
- Se mantuvieron los endpoints existentes de productos, categorias, marcas, lotes, inventarios, movimientos y traslados.
- Se integro soporte de imagen en `Producto` mediante `ImageField`.
- Se agrego exposicion de `imagen_url` en serializers de producto/catalogo.
- Se agrego `ProductoImagenView` para subir o eliminar imagen de producto.
- Se agrego `precio_con_iva` calculado desde `valor_unitario`.
- Se integro modulo de integraciones externas bajo `/api/v1/integrations/`.
- Se documentaron variables `DB_*_REMOTE` en `.env.example`.
- Se confirmo `pillow==12.2.0` como dependencia necesaria para `ImageField`.

## Frontend

- Se creo panel administrativo de productos.
- El panel permite crear producto simple usando `/api/inventory/productos/`.
- El panel permite ingresar producto con stock inicial usando `/api/inventory/ingresar-producto/`.
- Se agregaron campos de producto, lote e inventario inicial en la pantalla administrativa.
- Se conectaron categorias y marcas reales desde `/api/inventory/categorias/` y `/api/inventory/marcas/`.
- Se creo panel administrativo de trabajadores.
- Se elimino `username` como campo visible en el formulario de trabajadores.
- El frontend envia internamente `username = email` para mantener compatibilidad con el serializer del backend.
- Se mejoro la persistencia de sesion tras F5.
- Se agrego tolerancia al `404` de `/api/accounts/perfil/me/` cuando el token sigue siendo valido.
- Se actualizo el flujo de precios para usar `precio_con_iva` como precio principal cuando venga desde backend.
- Catalogo, detalle de producto, carrito y confirmacion usan una utilidad comun de precio.
- Se bloqueo el checkout para usuarios que no son cliente.
- Admin/trabajador puede ver carrito existente, pero no puede confirmar pedido ni crear direccion alternativa.

## Endpoints Nuevos O Modificados

### Inventory

- `GET /api/inventory/catalogo/`
- `GET /api/inventory/catalogo-cajas/`
- `GET /api/inventory/productos/`
- `POST /api/inventory/productos/`
- `PATCH /api/inventory/productos/<id>/imagen/`
- `DELETE /api/inventory/productos/<id>/imagen/`
- `POST /api/inventory/ingresar-producto/`
- `GET /api/inventory/categorias/`
- `POST /api/inventory/categorias/`
- `GET /api/inventory/marcas/`
- `POST /api/inventory/marcas/`
- `GET /api/inventory/lotes/`
- `GET /api/inventory/inventarios/`
- `GET /api/inventory/movimientos/`
- `GET /api/inventory/traslados/`

### Orders

- `POST /api/orders/pedidos/`
- `GET /api/orders/pedidos/mis-pedidos/`
- `GET /api/orders/pedidos/todos/`
- `GET /api/orders/pedidos/<id>/`
- `POST /api/orders/pedidos/<id>/aprobar/`

### Payments

- `POST /api/payments/webpay/iniciar/`
- `GET /api/payments/webpay/commit/`
- `GET /api/payments/webpay/estado/<token_ws>/`
- `GET /api/payments/mis-pagos/`
- `GET /api/payments/todos/`

### Logistics / Chilexpress

- `POST /api/logistics/cotizar/`
- `POST /api/logistics/envios/`
- `GET /api/logistics/envios/<pedido_id>/tracking/`

### Integrations

- `POST /api/v1/integrations/pedidos/`
- `GET /api/v1/integrations/api-clients/`
- `POST /api/v1/integrations/api-clients/crear/`
- `GET /api/v1/integrations/api-clients/<id>/`
- `PATCH /api/v1/integrations/api-clients/<id>/`
- `DELETE /api/v1/integrations/api-clients/<id>/`

## Cambios De Autenticacion Y Sesion

- El login frontend mantiene el uso de `POST /api/accounts/login/`.
- Se evito que el frontend dispare refresh token si no existe `refresh_token`.
- El interceptor evita refrescar token para rutas de login/token/refresh.
- La sesion se recupera desde `localStorage` al recargar la app.
- Si `/api/accounts/perfil/me/` responde `404`, se mantiene sesion con datos minimos del login/JWT.
- Logout limpia tokens y usuario en `localStorage`.

## Cambios De Inventario Y Productos

- Producto simple sigue disponible para creacion administrativa basica.
- Producto con stock inicial usa el endpoint compuesto `ingresar-producto`.
- El ingreso compuesto cubre producto, categorias, lote, inventario y movimiento de entrada.
- El listado administrativo de productos se ordena para mostrar productos recientes primero.
- El frontend conserva compatibilidad con productos que todavia no tengan stock.
- Se agrego soporte backend para imagen de producto, aunque el upload de imagen aun no esta conectado en el panel frontend.

## Cambios De Carrito Y Checkout

- El carrito usa precio consistente con catalogo y detalle.
- Se evita recalcular IVA en frontend cuando `precio_con_iva` viene desde backend.
- El checkout queda bloqueado para roles no cliente.
- Admin/trabajador no puede crear direccion alternativa ni pedido desde checkout.
- El mensaje mostrado para roles no cliente es:
  `"El flujo de compra solo está disponible para clientes. Usa una cuenta cliente para realizar pedidos."`

## Cambios De Logistica / Chilexpress

- Cotizacion de despacho conectada a `/api/logistics/cotizar/`.
- Tracking conectado a `/api/logistics/envios/<pedido_id>/tracking/`.
- Se mantiene `POST /api/logistics/envios/` disponible para creacion de envio/OT segun backend.
- El ZIP actualizado del backend incluye una propuesta de `PATCH /api/logistics/envios/<pedido_id>/estado/`, pero no esta integrada todavia.

## Cambios De Precios / IVA

- Backend expone `precio_con_iva`.
- Frontend usa `precio_con_iva` como precio visible principal cuando existe.
- Fallback de precio en frontend:
  `precio_con_iva` -> `precio_b2c` -> `precio_b2b` -> `valor_unitario` -> `precio`.
- Para usuario B2B se conserva fallback compatible, pero si existe `precio_con_iva` se usa como fuente principal.
- Se evita duplicar IVA en frontend.

## Pendientes Tecnicos

- No commitear archivos `.env` reales.
- Revisar migracion/base de datos local si falta la columna `producto.imagen`.
- Revisar si se integrara `PATCH /api/logistics/envios/<pedido_id>/estado/`.
- Si se integra el endpoint de estado de despacho, corregir nombres de roles del ZIP antes de copiar:
  `Administrador`, `Ejecutivo`, `OperadorLogistico`.
- Revisar seguridad backend de registro de trabajadores si sigue con `AllowAny`.
- Evaluar conectar upload de imagen de producto desde el panel administrativo.
- Evaluar conectar frontend de integraciones externas reales para API clients.
- Revisar warnings de chunk grande en build Vite si el proyecto crece.

## Pruebas Realizadas

- `python manage.py check`.
- `npm run build`.
- `git diff --check`.
- Prueba manual de catalogo.
- Prueba manual de bloqueo de checkout admin.
- Prueba manual de carrito con precio con IVA.
- Verificacion de persistencia de sesion tras recargar.
- Verificacion de rutas principales de frontend despues de resolver merges.
