import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PortalHeader } from './PortalHeader'
import { BottomNavbar } from './BottomNavbar'
import { useMe } from '../../features/silsilah'

interface MobileLayoutProps {
    children: ReactNode
    /** Custom class for the main content wrapper */
    className?: string
}

/**
 * Layout wrapper that shows:
 * - Desktop: PortalHeader at top
 * - Mobile: BottomNavbar at bottom (no top header)
 */
export function MobileLayout({ children, className = '' }: MobileLayoutProps) {
    const { data } = useMe()
    const user = data?.user

    return (
        <div className="min-h-screen bg-[#f8f6f6] flex flex-col">
            {/* Desktop Header - hidden on mobile, sticky at top */}
            <div className="hidden md:block sticky top-0 z-50">
                <PortalHeader />
            </div>

            {/* Mobile Link Warning Alert */}
            {user && !user.person_id && (
                <div className="md:hidden bg-[#ec1325] text-white px-4 py-3 flex items-center justify-between shadow-lg sticky top-0 z-[60]">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-xl">link_off</span>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold leading-tight">Akun Belum Tertaut</span>
                            <span className="text-[10px] opacity-90 leading-tight">Tautkan akun dengan data silsilah Anda.</span>
                        </div>
                    </div>
                    <Link
                        to="/claim-profile"
                        className="bg-white text-[#ec1325] text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-transform"
                    >
                        Tautkan Sekarang
                    </Link>
                </div>
            )}

            {/* Main Content */}
            {/* Add padding-bottom on mobile to avoid content being hidden behind navbar */}
            <main
                className={`flex-1 pb-[calc(60px+env(safe-area-inset-bottom,0px))] md:pb-0 ${className}`}
                style={{ paddingTop: user && !user.person_id ? '0' : 'env(safe-area-inset-top, 0px)' }}
            >
                {children}
            </main>

            {/* Mobile Bottom Navbar - hidden on desktop */}
            <BottomNavbar />
        </div>
    )
}
