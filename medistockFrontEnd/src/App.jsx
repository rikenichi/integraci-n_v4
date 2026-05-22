import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CarritoProvider } from './context/CarritoContext'

import Navbar from './components/Navbar'
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

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return <div className="spinner" />
  if (!usuario) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CarritoProvider>
          <Navbar />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/catalogo" element={<CatalogoPage />} />
            <Route path="/producto/:codigo" element={<ProductoDetallePage />} />
            <Route path="/carrito" element={<RutaProtegida><CarritoPage /></RutaProtegida>} />
            <Route path="/confirmar-pedido" element={<RutaProtegida><ConfirmacionPedidoPage /></RutaProtegida>} />
            <Route path="/resultado-pago/:pedidoId" element={<RutaProtegida><ResultadoPagoPage /></RutaProtegida>} />
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
            <Route path="/dte/:id/comprobante" element={<RutaProtegida><ComprobanteDtePage /></RutaProtegida>} />
            <Route path="/pedidos/:id" element={<RutaProtegida><PedidoDetallePage /></RutaProtegida>} />
          </Routes>
        </CarritoProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
