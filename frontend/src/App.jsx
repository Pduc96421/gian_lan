import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ModelListPage from './pages/ModelListPage'
import ModelDetailPage from './pages/ModelDetailPage'
import MonitorPage from './pages/MonitorPage'
import ModelStatsPage from './pages/ModelStatsPage'
import ModelStatsDetailPage from './pages/ModelStatsDetailPage'
import ModelSessionViolationsPage from './pages/ModelSessionViolationsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/models" replace />} />
          <Route path="/models" element={<ModelListPage />} />
          <Route path="/models/:id" element={<ModelDetailPage />} />
          <Route path="/models/stats" element={<ModelStatsPage />} />
          <Route path="/models/:id/stats" element={<ModelStatsDetailPage />} />
          <Route path="/models/:modelId/sessions/:caThiId/violations" element={<ModelSessionViolationsPage />} />
          <Route path="/monitor" element={<MonitorPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
