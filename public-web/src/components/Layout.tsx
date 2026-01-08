import { Outlet, Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuthCheck } from '@/hooks/useAuthCheck'

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'http://localhost:5174'


export default function Layout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { isLoggedIn, isLoading } = useAuthCheck()

    // Redirect to portal if already logged in and not loading
    if (!isLoading && isLoggedIn) {
        window.location.replace(PORTAL_URL)
        return null // Stop rendering checking...
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-[#e6dbdc] bg-white/90 backdrop-blur-md px-4 sm:px-10 py-3">
                <Link to="/" className="flex items-center gap-3 text-[#181112]">
                    <div className="size-10 flex items-center justify-center rounded-full bg-[#ec1325]/10 text-[#ec1325]">
                        <span className="material-symbols-outlined text-2xl">diversity_2</span>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-tight">Bani Abdul Manan</h2>
                </Link>

                <div className="hidden md:flex flex-1 justify-end gap-8">
                    <nav className="flex items-center gap-6">
                        <Link to="/" className="text-[#181112] text-sm font-medium hover:text-[#ec1325] transition-colors">
                            Beranda
                        </Link>
                        <Link to="/tentang" className="text-[#181112] text-sm font-medium hover:text-[#ec1325] transition-colors">
                            Tentang
                        </Link>
                        <Link to="/acara" className="text-[#181112] text-sm font-medium hover:text-[#ec1325] transition-colors">
                            Acara
                        </Link>
                        <Link to="/berita" className="text-[#181112] text-sm font-medium hover:text-[#ec1325] transition-colors">
                            Berita
                        </Link>
                    </nav>
                    <a
                        href={isLoggedIn ? PORTAL_URL : `${PORTAL_URL}/login`}
                        className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-[#ec1325] text-white text-sm font-bold hover:bg-[#c91020] transition-colors"
                    >
                        {isLoggedIn ? 'Portal' : 'Login'}
                    </a>
                </div>

                {/* Mobile Menu Icon */}
                <button
                    className="md:hidden flex items-center justify-center text-[#181112]"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <span className="material-symbols-outlined">
                        {isMobileMenuOpen ? 'close' : 'menu'}
                    </span>
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-x-0 top-[65px] bottom-0 z-40 bg-white p-4 animate-in slide-in-from-top-4 fade-in duration-200 border-t border-[#e6dbdc]">
                    <nav className="flex flex-col gap-4">
                        <Link
                            to="/"
                            className="text-[#181112] text-lg font-medium py-3 border-b border-gray-100 hover:text-[#ec1325] transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Beranda
                        </Link>
                        <Link
                            to="/tentang"
                            className="text-[#181112] text-lg font-medium py-3 border-b border-gray-100 hover:text-[#ec1325] transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Tentang
                        </Link>
                        <Link
                            to="/acara"
                            className="text-[#181112] text-lg font-medium py-3 border-b border-gray-100 hover:text-[#ec1325] transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Acara
                        </Link>
                        <Link
                            to="/berita"
                            className="text-[#181112] text-lg font-medium py-3 border-b border-gray-100 hover:text-[#ec1325] transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Berita
                        </Link>
                        <a
                            href={isLoggedIn ? PORTAL_URL : `${PORTAL_URL}/login`}
                            className="mt-4 flex w-full cursor-pointer items-center justify-center rounded-lg h-12 bg-[#ec1325] text-white text-base font-bold hover:bg-[#c91020] transition-colors"
                        >
                            {isLoggedIn ? 'Portal' : 'Login'}
                        </a>
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-[#e6dbdc] py-12 px-4 sm:px-10">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between gap-10">
                    <div className="flex flex-col gap-4 max-w-sm">
                        <div className="flex items-center gap-2 text-[#181112]">
                            <span className="material-symbols-outlined text-[#ec1325]">diversity_2</span>
                            <span className="font-bold text-lg">Bani Abdul Manan</span>
                        </div>
                        <p className="text-[#896165] text-sm">
                            Portal digital resmi keluarga besar Bani Abdul Manan. Menjaga tali silaturahmi lintas jarak dan waktu.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-12">
                        <div className="flex flex-col gap-3">
                            <h4 className="text-[#181112] font-bold text-sm">Portal</h4>
                            <a href={isLoggedIn ? PORTAL_URL : `${PORTAL_URL}/login`} className="text-[#896165] text-sm hover:text-[#ec1325]">{isLoggedIn ? 'Portal' : 'Login'}</a>
                            <a href={`${PORTAL_URL}/register`} className="text-[#896165] text-sm hover:text-[#ec1325]">Daftar</a>
                        </div>
                        <div className="flex flex-col gap-3">
                            <h4 className="text-[#181112] font-bold text-sm">Keluarga</h4>
                            <a href={PORTAL_URL} className="text-[#896165] text-sm hover:text-[#ec1325]">Silsilah</a>
                            <Link to="/acara" className="text-[#896165] text-sm hover:text-[#ec1325]">Acara</Link>
                            <Link to="/berita" className="text-[#896165] text-sm hover:text-[#ec1325]">Berita</Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1200px] mx-auto mt-12 pt-6 border-t border-[#e6dbdc] flex flex-col sm:flex-row justify-between items-center text-xs text-[#896165]">
                    <p>© 2024 Bani Abdul Manan. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
