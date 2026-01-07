import { Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import AboutPage from '@/pages/AboutPage'
import EventsPage from '@/pages/EventsPage'
import EventDetailPage from '@/pages/EventDetailPage'
import NewsPage from '@/pages/NewsPage'
import NewsDetailPage from '@/pages/NewsDetailPage'
import Layout from '@/components/Layout'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="tentang" element={<AboutPage />} />
        <Route path="acara" element={<EventsPage />} />
        <Route path="acara/:slug" element={<EventDetailPage />} />
        <Route path="berita" element={<NewsPage />} />
        <Route path="berita/:slug" element={<NewsDetailPage />} />
      </Route>
    </Routes>
  )
}

export default App

