import { Routes, Route } from 'react-router-dom'
import { AuthGuard } from './components/AuthGuard'
import { HomePage } from './pages/home/HomePage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ClaimProfilePage } from './pages/auth/ClaimProfilePage'
import { SilsilahPage } from './pages/silsilah/SilsilahPage'
import { BranchPage } from './pages/silsilah/BranchPage'
import { PersonDetailPage } from './pages/silsilah/PersonDetailPage'
import { EventsPage } from './pages/events/EventsPage'
import { EventDetailPage } from './pages/events/EventDetailPage'
import { ArchivesPage } from './pages/archives/ArchivesPage'
import { NewsDetailPage } from './pages/news/NewsDetailPage'
import { NewsListPage } from './pages/news/NewsListPage'
import { SubmissionsPage } from './pages/submissions/SubmissionsPage'

function App() {
  return (
    <Routes>
      {/* Public Auth Route */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes - require authentication */}
      <Route path="/" element={<AuthGuard><HomePage /></AuthGuard>} />
      <Route path="/claim-profile" element={<AuthGuard><ClaimProfilePage /></AuthGuard>} />
      <Route path="/silsilah" element={<AuthGuard><SilsilahPage /></AuthGuard>} />
      <Route path="/silsilah/branch/:id" element={<AuthGuard><BranchPage /></AuthGuard>} />
      <Route path="/silsilah/person/:id" element={<AuthGuard><PersonDetailPage /></AuthGuard>} />
      <Route path="/submissions" element={<AuthGuard><SubmissionsPage /></AuthGuard>} />
      <Route path="/events" element={<AuthGuard><EventsPage /></AuthGuard>} />
      <Route path="/events/:id" element={<AuthGuard><EventDetailPage /></AuthGuard>} />
      <Route path="/news" element={<AuthGuard><NewsListPage /></AuthGuard>} />
      <Route path="/news/:id" element={<AuthGuard><NewsDetailPage /></AuthGuard>} />
      <Route path="/archives" element={<AuthGuard><ArchivesPage /></AuthGuard>} />

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
