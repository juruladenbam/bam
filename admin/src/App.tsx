import { Routes, Route } from 'react-router-dom'
import { AdminLayout } from './components/layout/AdminLayout'
import { DashboardPage } from './pages/DashboardPage'
import { PersonsPage } from './pages/persons/PersonsPage'
import { PersonFormPage } from './pages/persons/PersonFormPage'
import { MarriagesPage } from './pages/marriages/MarriagesPage'
import { MarriageFormPage } from './pages/marriages/MarriageFormPage'
import { BranchesPage } from './pages/branches/BranchesPage'

function App() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />

        {/* Persons */}
        <Route path="/persons" element={<PersonsPage />} />
        <Route path="/persons/new" element={<PersonFormPage />} />
        <Route path="/persons/:id/edit" element={<PersonFormPage />} />

        {/* Marriages */}
        <Route path="/marriages" element={<MarriagesPage />} />
        <Route path="/marriages/new" element={<MarriageFormPage />} />
        <Route path="/marriages/:id/edit" element={<MarriageFormPage />} />

        {/* Branches */}
        <Route path="/branches" element={<BranchesPage />} />

        {/* 404 */}
        <Route path="*" element={
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-[#ec1325] mb-2">404</h1>
              <p className="text-[#896165]">Halaman tidak ditemukan</p>
            </div>
          </div>
        } />
      </Routes>
    </AdminLayout>
  )
}

export default App
