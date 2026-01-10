import { Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import AboutPage from '@/pages/AboutPage'
import EventsPage from '@/pages/EventsPage'
import EventDetailPage from '@/pages/EventDetailPage'
import NewsPage from '@/pages/NewsPage'
import NewsDetailPage from '@/pages/NewsDetailPage'
import LayananPage from '@/pages/LayananPage'
import Layout from '@/components/Layout'
import ScrollToTop from '@/components/ScrollToTop'

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="tentang" element={<AboutPage />} />
          <Route path="acara" element={<EventsPage />} />
          <Route path="acara/:slug" element={<EventDetailPage />} />
          <Route path="berita" element={<NewsPage />} />
          <Route path="berita/:slug" element={<NewsDetailPage />} />
          <Route path="layanan" element={<LayananPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App

