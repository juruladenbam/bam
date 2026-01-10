import { type ReactNode, useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { silsilahApi } from '../features/silsilah/api/silsilahApi'

interface AuthGuardProps {
    children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
    const navigate = useNavigate()
    const location = useLocation()
    const [isChecking, setIsChecking] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    const checkAuth = useCallback(async (silent = false) => {
        if (!silent) {
            setIsChecking(true)
            setIsAuthenticated(false)
        }

        try {
            await silsilahApi.getMe()
            setIsAuthenticated(true)
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

    return <>{children}</>
}
