import { Routes, Route, Navigate } from 'react-router-dom'
import { SilsilahPage } from './pages/silsilah/SilsilahPage'
import { BranchPage } from './pages/silsilah/BranchPage'
import { PersonDetailPage } from './pages/silsilah/PersonDetailPage'

function App() {
  return (
    <Routes>
      {/* Default redirect to silsilah */}
      <Route path="/" element={<Navigate to="/silsilah" replace />} />

      {/* Silsilah routes */}
      <Route path="/silsilah" element={<SilsilahPage />} />
      <Route path="/silsilah/branch/:id" element={<BranchPage />} />
      <Route path="/silsilah/person/:id" element={<PersonDetailPage />} />

      {/* 404 */}
      <Route path="*" element={
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#ec1325] mb-2">404</h1>
            <p className="text-[#896165]">Halaman tidak ditemukan</p>
          </div>
        </div>
      } />
    </Routes>
  )
}

export default App
