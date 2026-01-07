import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminLayout } from './components/layout/AdminLayout'
import { DashboardPage } from './pages/DashboardPage'
import { PersonsPage } from './pages/persons/PersonsPage'
import { PersonFormPage } from './pages/persons/PersonFormPage'
import { MarriagesPage } from './pages/marriages/MarriagesPage'
import { MarriageFormPage } from './pages/marriages/MarriageFormPage'
import { BranchesPage } from './pages/branches/BranchesPage'
import { EventListPage } from './pages/events/EventListPage'
import { EventFormPage } from './pages/events/EventFormPage'
import { NewsListPage } from './pages/news/NewsListPage'
import { NewsFormPage } from './pages/news/NewsFormPage'
import { MediaListPage } from './pages/media/MediaListPage'
import { MediaUploadPage } from './pages/media/MediaUploadPage'
import { LoginPage } from './pages/auth/LoginPage'
import { SubmissionListPage } from './pages/submissions/SubmissionListPage'
import { SubmissionDetailPage } from './pages/submissions/SubmissionDetailPage'
import { UserListPage } from './pages/users/UserListPage'
import AboutSettingsPage from './pages/settings/AboutSettingsPage'
import HomeSettingsPage from './pages/settings/HomeSettingsPage'
import SettingsLayout from './pages/settings/SettingsLayout'
import ScrollToTop from './components/ScrollToTop'

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route path="/*" element={
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

              {/* Events */}
              <Route path="/events" element={<EventListPage />} />
              <Route path="/events/create" element={<EventFormPage />} />
              <Route path="/events/:id/edit" element={<EventFormPage />} />

              {/* News */}
              <Route path="/news" element={<NewsListPage />} />
              <Route path="/news/create" element={<NewsFormPage />} />
              <Route path="/news/:id/edit" element={<NewsFormPage />} />

              {/* Media/Archives */}
              <Route path="/media" element={<MediaListPage />} />
              <Route path="/media/upload" element={<MediaUploadPage />} />

              {/* Submissions */}
              <Route path="/submissions" element={<SubmissionListPage />} />
              <Route path="/submissions/:id" element={<SubmissionDetailPage />} />

              {/* Users */}
              <Route path="/users" element={<UserListPage />} />

              {/* Settings with Tabs Layout */}
              <Route path="/settings" element={<SettingsLayout />}>
                <Route index element={<Navigate to="/settings/home" replace />} />
                <Route path="home" element={<HomeSettingsPage />} />
                <Route path="about" element={<AboutSettingsPage />} />
              </Route>

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
        } />
      </Routes>
    </>
  )
}

export default App
