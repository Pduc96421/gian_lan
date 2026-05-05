import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ModelListPage from './pages/ModelListPage'
import ModelDetailPage from './pages/ModelDetailPage'
import MonitorPage from './pages/MonitorPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/models" replace />} />
          <Route path="/models" element={<ModelListPage />} />
          <Route path="/models/:id" element={<ModelDetailPage />} />
          <Route path="/monitor" element={<MonitorPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
