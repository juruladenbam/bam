import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/home/HomePage'
import { SilsilahPage } from './pages/silsilah/SilsilahPage'
import { BranchPage } from './pages/silsilah/BranchPage'
import { PersonDetailPage } from './pages/silsilah/PersonDetailPage'
import { EventsPage } from './pages/events/EventsPage'
import { EventDetailPage } from './pages/events/EventDetailPage'
import { ArchivesPage } from './pages/archives/ArchivesPage'
import { NewsDetailPage } from './pages/news/NewsDetailPage'
import { SubmissionsPage } from './pages/submissions/SubmissionsPage'

function App() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<HomePage />} />

      {/* Silsilah routes */}
      <Route path="/silsilah" element={<SilsilahPage />} />
      <Route path="/silsilah/branch/:id" element={<BranchPage />} />
      <Route path="/silsilah/person/:id" element={<PersonDetailPage />} />

      {/* Submissions */}
      <Route path="/submissions" element={<SubmissionsPage />} />

      {/* Static pages */}
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:id" element={<EventDetailPage />} />
      <Route path="/news/:id" element={<NewsDetailPage />} />
      <Route path="/archives" element={<ArchivesPage />} />

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

