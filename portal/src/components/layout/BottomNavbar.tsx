import { Link, useLocation } from 'react-router-dom'

interface NavItem {
    icon: string
    label: string
    path: string
    matchPaths?: string[] // Additional paths that should mark this item as active
}

const navItems: NavItem[] = [
    { icon: 'home', label: 'Beranda', path: '/' },
    { icon: 'account_tree', label: 'Silsilah', path: '/silsilah' },
    { icon: 'event', label: 'Acara', path: '/events' },
    { icon: 'newspaper', label: 'Berita', path: '/news' },
    { icon: 'person', label: 'Akun', path: '/profile' },
]

export function BottomNavbar() {
    const location = useLocation()

    const isActive = (item: NavItem) => {
        // Exact match for home
        if (item.path === '/' && location.pathname === '/') return true
        // Prefix match for other routes (but not for home)
        if (item.path !== '/' && location.pathname.startsWith(item.path)) return true
        // Check additional match paths
        if (item.matchPaths?.some(p => location.pathname.startsWith(p))) return true
        return false
    }

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e6dbdc] md:hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
            <div className="flex items-center justify-around h-[60px]">
                {navItems.map((item) => {
                    const active = isActive(item)
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${active
                                    ? 'text-[#ec1325]'
                                    : 'text-[#896165] hover:text-[#181112]'
                                }`}
                        >
                            <span
                                className={`material-symbols-outlined text-[22px] ${active ? 'font-medium' : ''
                                    }`}
                                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                            >
                                {item.icon}
                            </span>
                            <span className={`text-[10px] mt-0.5 ${active ? 'font-bold' : 'font-medium'}`}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
