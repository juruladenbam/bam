import { Outlet, Link } from 'react-router-dom'

export default function Layout() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-green-800 text-white">
                <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold">
                        🏠 BAM
                    </Link>
                    <div className="flex gap-6">
                        <Link to="/" className="hover:text-green-200">Beranda</Link>
                        <Link to="/tentang" className="hover:text-green-200">Tentang</Link>
                        <Link to="/login" className="bg-white text-green-800 px-4 py-2 rounded-lg font-medium hover:bg-green-100">
                            Login
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main>
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-gray-100 py-8 mt-auto">
                <div className="container mx-auto px-4 text-center text-gray-600">
                    <p>© 2024 Bani Abdul Manan. Portal Digital Keluarga.</p>
                </div>
            </footer>
        </div>
    )
}
