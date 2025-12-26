import { Link, useLocation } from 'react-router-dom'

interface NavItem {
    label: string
    path: string
    icon: string
}

const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/', icon: 'dashboard' },
    { label: 'Anggota', path: '/persons', icon: 'group' },
    { label: 'Pernikahan', path: '/marriages', icon: 'favorite' },
    { label: 'Qobilah', path: '/branches', icon: 'account_tree' },
]

interface AdminLayoutProps {
    children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const location = useLocation()

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/'
        return location.pathname.startsWith(path)
    }

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
                            <p className="text-sm font-medium truncate">Admin</p>
                            <p className="text-xs text-white/50 truncate">admin@bam.id</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
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
                        <button className="p-2 hover:bg-[#f8f6f6] rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-[#896165]">logout</span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
