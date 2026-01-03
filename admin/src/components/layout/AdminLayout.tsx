import { Link, useLocation, Navigate } from 'react-router-dom'
import { useUser, useLogout } from '../../features/auth/hooks/useAuth'
import { useState } from 'react'

interface NavItem {
    label: string
    path: string
    icon: string
}

const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/', icon: 'dashboard' },
    { label: 'Submission', path: '/submissions', icon: 'inbox' },
    { label: 'Anggota', path: '/persons', icon: 'group' },
    { label: 'Pernikahan', path: '/marriages', icon: 'favorite' },
    { label: 'Qobilah', path: '/branches', icon: 'account_tree' },
    { label: 'Acara', path: '/events', icon: 'event' },
    { label: 'Berita', path: '/news', icon: 'article' },
    { label: 'Arsip', path: '/media', icon: 'perm_media' },
    { label: 'Pengguna', path: '/users', icon: 'manage_accounts' },
]

interface AdminLayoutProps {
    children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const location = useLocation()
    const { data: userResponse, isLoading, error } = useUser()
    const logout = useLogout()
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/'
        return location.pathname.startsWith(path)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f6f6]">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined animate-spin text-4xl text-[#ec1325]">progress_activity</span>
                    <p className="text-[#896165] font-medium animate-pulse">Memuat...</p>
                </div>
            </div>
        )
    }

    if (error) {
        // Check if 403 (Forbidden) - User logged in but not admin
        const status = (error as any)?.response?.status
        if (status === 403) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#f8f6f6] p-4">
                    <div className="bg-white max-w-md w-full rounded-2xl border border-[#e6dbdc] shadow-lg p-8 text-center">
                        <div className="bg-red-100 size-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl text-red-600">block</span>
                        </div>
                        <h1 className="text-xl font-bold text-[#181112] mb-2">Akses Ditolak</h1>
                        <p className="text-[#896165] mb-6">Akun Anda tidak memiliki izin untuk mengakses halaman admin.</p>
                        <button
                            onClick={() => logout.mutate()}
                            className="bg-[#181112] text-white px-6 py-2 rounded-lg font-medium hover:bg-black transition-colors"
                        >
                            Keluar & Ganti Akun
                        </button>
                    </div>
                </div>
            )
        }
        // If 401 or other error, redirect to login
        return <Navigate to="/login" replace />
    }

    if (!userResponse?.data?.user) {
        return <Navigate to="/login" replace />
    }

    const user = userResponse.data.user

    return (
        <div className="min-h-screen bg-[#f8f6f6] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#181112] text-white flex flex-col shrink-0">
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="size-10 bg-[#ec1325] rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-white">settings</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">BAM Admin</h1>
                            <p className="text-xs text-white/50">Panel Pengelola</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                ? 'bg-[#ec1325] text-white'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-2">
                        <div className="size-8 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm">person</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-white/50 truncate">{user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen overflow-hidden relative">
                {/* Header */}
                <header className="bg-white border-b border-[#e6dbdc] px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-[#181112]">
                            {navItems.find((item) => isActive(item.path))?.label || 'Admin'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-[#f8f6f6] rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-[#896165]">notifications</span>
                        </button>
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="p-2 hover:bg-[#f8f6f6] rounded-lg transition-colors text-[#896165] hover:text-[#ec1325]"
                            title="Keluar"
                        >
                            <span className="material-symbols-outlined">logout</span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-6">
                    {children}
                </div>

                {/* Logout Confirmation Modal */}
                {showLogoutConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 animate-in fade-in zoom-in duration-200">
                            <div className="mb-4">
                                <span className="material-symbols-outlined text-4xl text-[#ec1325]">logout</span>
                            </div>
                            <h3 className="text-lg font-bold text-[#181112] mb-2">Konfirmasi Keluar</h3>
                            <p className="text-[#896165] mb-6">Apakah Anda yakin ingin keluar dari panel admin?</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 py-2.5 rounded-xl font-medium text-[#181112] bg-[#f8f6f6] hover:bg-gray-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => {
                                        setShowLogoutConfirm(false)
                                        logout.mutate()
                                    }}
                                    disabled={logout.isPending}
                                    className="flex-1 py-2.5 rounded-xl font-medium bg-[#ec1325] text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    {logout.isPending ? 'Keluar...' : 'Ya, Keluar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
