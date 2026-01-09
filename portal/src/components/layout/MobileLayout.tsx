import type { ReactNode } from 'react'
import { PortalHeader } from './PortalHeader'
import { BottomNavbar } from './BottomNavbar'

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
    return (
        <div className="min-h-screen bg-[#f8f6f6] flex flex-col">
            {/* Desktop Header - hidden on mobile */}
            <div className="hidden md:block">
                <PortalHeader />
            </div>

            {/* Main Content */}
            {/* Add padding-bottom on mobile to avoid content being hidden behind navbar */}
            <main
                className={`flex-1 pb-[calc(60px+env(safe-area-inset-bottom,0px))] md:pb-0 ${className}`}
                style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
            >
                {children}
            </main>

            {/* Mobile Bottom Navbar - hidden on desktop */}
            <BottomNavbar />
        </div>
    )
}
