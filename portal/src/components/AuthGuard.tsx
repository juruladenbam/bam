import { type ReactNode, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SplashScreen } from './SplashScreen'
import { usePortalMode } from '../hooks/usePortalMode'

interface AuthGuardProps {
    children: ReactNode
}

const PRELOAD_DONE_KEY = 'bam_preload_done'

export function AuthGuard({ children }: AuthGuardProps) {
    const navigate = useNavigate()
    const [showSplash, setShowSplash] = useState(false)

    // Use the central hook
    const {
        loginEnabled,
        isAuthenticated,
        isLoading
    } = usePortalMode()

    useEffect(() => {
        // Only redirect if NOT loading and login IS enabled and NOT authenticated
        if (!isLoading && loginEnabled && !isAuthenticated) {
            const returnUrl = encodeURIComponent(window.location.href)
            navigate(`/login?redirect=${returnUrl}`, { replace: true })
        }
    }, [isLoading, loginEnabled, isAuthenticated, navigate])

    // Handle splash logic
    useEffect(() => {
        // Check for splash only once when auth check is done
        if (!isLoading) {
            const cacheExists = localStorage.getItem('bam-portal-cache')
            const preloadDone = localStorage.getItem(PRELOAD_DONE_KEY)
            const preloadTimestamp = preloadDone ? parseInt(preloadDone) : 0
            const isPreloadFresh = Date.now() - preloadTimestamp < 24 * 60 * 60 * 1000 // 24 hours

            // Show splash if:
            // 1. Cache doesn't exist AND Preload not fresh
            // 2. AND we are either Authenticated OR (Login Disabled AND (Guest or NibLinked))
            // Basically if we get ACCESS, we might want splash.
            const hasAccess = isAuthenticated || !loginEnabled;

            if (!cacheExists && !isPreloadFresh && hasAccess) {
                setShowSplash(true)
            }
        }
    }, [isLoading, isAuthenticated, loginEnabled])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f6f6]">
                <div className="flex flex-col items-center gap-4">
                    <span className="block size-8 border-4 border-[#ec1325]/30 border-t-[#ec1325] rounded-full animate-spin"></span>
                    <p className="text-[#896165] text-sm">Memuat...</p>
                </div>
            </div>
        )
    }

    // If login required but not auth, render nothing (redirecting)
    if (loginEnabled && !isAuthenticated) {
        return null
    }

    if (showSplash) {
        return <SplashScreen onComplete={() => setShowSplash(false)} />
    }

    return <>{children}</>
}
