import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Landing from '../pages/Landing'
import OctopusFlow from '../pages/OctopusFlow'
import ProductAccess from '../pages/ProductAccess'
import '../styles/globals.css'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing loginUrl="/acceder" />} />
        <Route path="/octopusflow" element={<OctopusFlow />} />
        <Route path="/acceder" element={<ProductAccess />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
