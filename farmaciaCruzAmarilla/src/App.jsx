import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'

import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import ProductDetailPage from './pages/ProductDetailPage'
import AvailabilityPage from './pages/AvailabilityPage'
import AboutPage from './pages/AboutPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/producto/:codigo" element={<ProductDetailPage />} />
          <Route path="/disponibilidad" element={<AvailabilityPage />} />
          <Route path="/sobre-nosotros" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
