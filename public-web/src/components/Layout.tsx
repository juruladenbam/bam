import { Outlet, Link } from 'react-router-dom'

export default function Layout() {
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
                        <a href="#events" className="text-[#181112] text-sm font-medium hover:text-[#ec1325] transition-colors">
                            Acara
                        </a>
                    </nav>
                    <Link
                        to="/login"
                        className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-[#ec1325] text-white text-sm font-bold hover:bg-[#c91020] transition-colors"
                    >
                        Login
                    </Link>
                </div>

                {/* Mobile Menu Icon */}
                <button className="md:hidden flex items-center justify-center text-[#181112]">
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </header>

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
                            <Link to="/login" className="text-[#896165] text-sm hover:text-[#ec1325]">Login</Link>
                            <Link to="/register" className="text-[#896165] text-sm hover:text-[#ec1325]">Daftar</Link>
                        </div>
                        <div className="flex flex-col gap-3">
                            <h4 className="text-[#181112] font-bold text-sm">Keluarga</h4>
                            <a href="#" className="text-[#896165] text-sm hover:text-[#ec1325]">Silsilah</a>
                            <a href="#events" className="text-[#896165] text-sm hover:text-[#ec1325]">Acara</a>
                            <a href="#" className="text-[#896165] text-sm hover:text-[#ec1325]">Galeri</a>
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
