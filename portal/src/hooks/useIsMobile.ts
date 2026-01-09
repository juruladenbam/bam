import { useState, useEffect } from 'react'

/**
 * Hook for responsive mobile detection
 * @param breakpoint - Width breakpoint in pixels (default: 768 for md)
 * @returns boolean indicating if viewport is below breakpoint
 */
export function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < breakpoint)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [breakpoint])

    return isMobile
}
