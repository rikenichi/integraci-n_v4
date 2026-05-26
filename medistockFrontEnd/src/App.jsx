import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CarritoProvider } from './context/CarritoContext'
import { ToastProvider } from './context/ToastContext'
import { puedeComprar } from './utils/permisos'

import Navbar from './components/Navbar'
import ToastViewport from './components/ToastViewport'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegistroPage from './pages/RegistroPage'
import CatalogoPage from './pages/CatalogoPage'
import ProductoDetallePage from './pages/ProductoDetallePage'
import CarritoPage from './pages/CarritoPage'
import ConfirmacionPedidoPage from './pages/ConfirmacionPedidoPage'
import ResultadoPagoPage from './pages/ResultadoPagoPage'
import WebpayResultadoPage from './pages/WebpayResultadoPage'
import TrackingPage from './pages/TrackingPage'
import PanelPage from './pages/PanelPage'
import PerfilPage from './pages/PerfilPage'
import ComprobanteDtePage from './pages/ComprobanteDtePage'
import PedidoDetallePage from './pages/PedidoDetallePage'
import ComprasProveedorPage from './pages/ComprasProveedorPage'
import TrasladosInventarioPage from './pages/TrasladosInventarioPage'
import IntegracionesPage from './pages/IntegracionesPage'
import ConciliacionPagosPage from './pages/ConciliacionPagosPage'
import ConveniosInstitucionalesPage from './pages/ConveniosInstitucionalesPage'
import GuiasDespachoPage from './pages/GuiasDespachoPage'
import AprobacionesB2BPage from './pages/AprobacionesB2BPage'
import DashboardAnalistaPage from './pages/DashboardAnalistaPage'
import AdminProductosPage from './pages/admin/AdminProductosPage'
import AdminTrabajadoresPage from './pages/admin/AdminTrabajadoresPage'
import ContactoPage from './pages/ContactoPage'

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return <div className="spinner" />
  if (!usuario) return <Navigate to="/login" replace />
  return children
}

/**
 * Bloquea rutas comerciales (carrito, checkout, pago) para roles que no compran:
 * analista, operador, trabajador.
 */
function RutaSoloCompradores({ children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return <div className="spinner" />
  if (!usuario) return <Navigate to="/login" replace />
  if (!puedeComprar(usuario.rol)) return <Navigate to="/panel" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
        <CarritoProvider>
          <Navbar />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/contacto" element={<ContactoPage />} />
            <Route path="/catalogo" element={<CatalogoPage />} />
            <Route path="/producto/:codigo" element={<ProductoDetallePage />} />
            <Route path="/carrito" element={<RutaSoloCompradores><CarritoPage /></RutaSoloCompradores>} />
            <Route path="/confirmar-pedido" element={<RutaSoloCompradores><ConfirmacionPedidoPage /></RutaSoloCompradores>} />
            <Route path="/resultado-pago/:pedidoId" element={<RutaSoloCompradores><ResultadoPagoPage /></RutaSoloCompradores>} />
            <Route path="/resultado-pago" element={<WebpayResultadoPage />} />
            {/* Página de retorno de WebPay — accesible sin login porque viene de redirect de Transbank */}
            <Route path="/webpay/resultado" element={<WebpayResultadoPage />} />
            <Route path="/tracking/:despachoId" element={<RutaProtegida><TrackingPage /></RutaProtegida>} />
            <Route path="/panel" element={<RutaProtegida><PanelPage /></RutaProtegida>} />
            <Route path="/perfil" element={<RutaProtegida><PerfilPage /></RutaProtegida>} />
            <Route path="/panel/compras-proveedor" element={<RutaProtegida><ComprasProveedorPage /></RutaProtegida>} />
            <Route path="/panel/traslados-inventario" element={<RutaProtegida><TrasladosInventarioPage /></RutaProtegida>} />
            <Route path="/panel/integraciones" element={<RutaProtegida><IntegracionesPage /></RutaProtegida>} />
            <Route path="/panel/conciliacion-pagos" element={<RutaProtegida><ConciliacionPagosPage /></RutaProtegida>} />
            <Route path="/panel/convenios-institucionales" element={<RutaProtegida><ConveniosInstitucionalesPage /></RutaProtegida>} />
            <Route path="/panel/guias-despacho" element={<RutaProtegida><GuiasDespachoPage /></RutaProtegida>} />
            <Route path="/panel/aprobaciones-b2b" element={<RutaProtegida><AprobacionesB2BPage /></RutaProtegida>} />
            <Route path="/panel/dashboard-analista" element={<RutaProtegida><DashboardAnalistaPage /></RutaProtegida>} />
            <Route path="/admin/productos" element={<RutaProtegida><AdminProductosPage /></RutaProtegida>} />
            <Route path="/admin/trabajadores" element={<RutaProtegida><AdminTrabajadoresPage /></RutaProtegida>} />
            <Route path="/dte/:id/comprobante" element={<RutaProtegida><ComprobanteDtePage /></RutaProtegida>} />
            <Route path="/pedidos/:id" element={<RutaProtegida><PedidoDetallePage /></RutaProtegida>} />
          </Routes>
          <ToastViewport />
        </CarritoProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
