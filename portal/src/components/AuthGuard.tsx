import { type ReactNode, useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { silsilahApi } from '../features/silsilah/api/silsilahApi'
import { SplashScreen } from './SplashScreen'

interface AuthGuardProps {
    children: ReactNode
}

// Key to track if initial preload has been done
const PRELOAD_DONE_KEY = 'bam_preload_done'

export function AuthGuard({ children }: AuthGuardProps) {
    const navigate = useNavigate()
    const location = useLocation()
    const [isChecking, setIsChecking] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [showSplash, setShowSplash] = useState(false)

    const checkAuth = useCallback(async (silent = false) => {
        if (!silent) {
            setIsChecking(true)
            setIsAuthenticated(false)
        }

        try {
            await silsilahApi.getMe()
            setIsAuthenticated(true)

            // Check if we have cached calendar data OR preload was done recently
            const cacheExists = localStorage.getItem('bam-portal-cache')
            const preloadDone = localStorage.getItem(PRELOAD_DONE_KEY)
            const preloadTimestamp = preloadDone ? parseInt(preloadDone) : 0
            const isPreloadFresh = Date.now() - preloadTimestamp < 24 * 60 * 60 * 1000 // 24 hours

            // Show splash only if no cache exists AND preload wasn't done recently
            if (!cacheExists && !isPreloadFresh && !silent) {
                setShowSplash(true)
            }
        } catch {
            // Not authenticated, redirect to login
            const returnUrl = encodeURIComponent(window.location.href)
            navigate(`/login?redirect=${returnUrl}`, { replace: true })
        } finally {
            if (!silent) {
                setIsChecking(false)
            }
        }
    }, [navigate])

    // Check auth on mount
    useEffect(() => {
        checkAuth()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Re-check auth silently when pathname changes (if already authenticated)
    useEffect(() => {
        if (isAuthenticated) {
            checkAuth(true) // Silent check - no loading shown
        }
    }, [location.pathname, isAuthenticated, checkAuth])

    // Also check auth when window gains focus (silent check)
    useEffect(() => {
        const handleFocus = () => {
            checkAuth(true)
        }

        window.addEventListener('focus', handleFocus)
        return () => window.removeEventListener('focus', handleFocus)
    }, [checkAuth])

    // Handle splash completion
    const handleSplashComplete = useCallback(() => {
        setShowSplash(false)
    }, [])

    // Initial auth checking state
    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f6f6]">
                <div className="flex flex-col items-center gap-4">
                    <span className="block size-8 border-4 border-[#ec1325]/30 border-t-[#ec1325] rounded-full animate-spin"></span>
                    <p className="text-[#896165] text-sm">Memuat...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    // Show splash screen with data preload
    if (showSplash) {
        return <SplashScreen onComplete={handleSplashComplete} />
    }

    return <>{children}</>
}
