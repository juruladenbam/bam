import { Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import AboutPage from '@/pages/AboutPage'
import LoginPage from '@/pages/LoginPage'
import EventsPage from '@/pages/EventsPage'
import NewsPage from '@/pages/NewsPage'
import Layout from '@/components/Layout'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="tentang" element={<AboutPage />} />
        <Route path="acara" element={<EventsPage />} />
        <Route path="berita" element={<NewsPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>
    </Routes>
  )
}

export default App
