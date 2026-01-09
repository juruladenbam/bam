import type { ReactNode } from 'react'
import { PortalHeader } from './PortalHeader'
import { useIsMobile } from '../../hooks/useIsMobile'

interface FocusedLayoutProps {
    children: ReactNode
    /** Custom class for the main content wrapper */
    className?: string
}

/**
 * Layout wrapper for focused/detail pages:
 * - Desktop: Shows PortalHeader
 * - Mobile: No header/navbar, content takes full screen (pages should have own back button)
 */
export function FocusedLayout({ children, className = '' }: FocusedLayoutProps) {
    const isMobile = useIsMobile()

    return (
        <div className={`min-h-screen bg-[#f8f6f6] flex flex-col ${className}`}>
            {/* Desktop Header - hidden on mobile */}
            {!isMobile && <PortalHeader />}

            {/* Main Content - full height on mobile */}
            <main className="flex-1">
                {children}
            </main>
        </div>
    )
}
