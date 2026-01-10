import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

interface SplashScreenProps {
    onComplete: () => void
}

// API base for fetching calendar
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Fetch calendar data
async function fetchCalendar(year: number, month: number) {
    const response = await fetch(
        `${API_BASE}/portal/calendar?year=${year}&month=${month}`,
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        }
    )

    if (!response.ok) {
        throw new Error('Failed to fetch calendar data')
    }

    const json = await response.json()
    return json.data
}

// Get adjacent month
function getAdjacentMonth(year: number, month: number, offset: number) {
    let newMonth = month + offset
    let newYear = year
    while (newMonth > 12) {
        newMonth -= 12
        newYear++
    }
    while (newMonth < 1) {
        newMonth += 12
        newYear--
    }
    return { year: newYear, month: newMonth }
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
    const queryClient = useQueryClient()
    const [progress, setProgress] = useState(0)
    const [loadingText, setLoadingText] = useState('Mempersiapkan...')

    useEffect(() => {
        const preloadData = async () => {
            const now = new Date()
            const currentYear = now.getFullYear()
            const currentMonth = now.getMonth() + 1

            const months = [
                { year: currentYear, month: currentMonth, label: 'Memuat data...' },
                { ...getAdjacentMonth(currentYear, currentMonth, 1), label: 'Menyimpan data...' },
                { ...getAdjacentMonth(currentYear, currentMonth, -1), label: 'Menampilkan data...' },
            ]

            let completed = 0

            for (const m of months) {
                setLoadingText(m.label)
                try {
                    // Prefetch and cache the calendar data
                    await queryClient.prefetchQuery({
                        queryKey: ['calendar', m.year, m.month],
                        queryFn: () => fetchCalendar(m.year, m.month),
                        staleTime: 5 * 60 * 1000, // 5 minutes
                    })
                } catch (error) {
                    console.error(`Failed to preload calendar ${m.year}/${m.month}:`, error)
                }
                completed++
                setProgress((completed / months.length) * 100)
            }

            setLoadingText('Selesai!')

            // Save preload timestamp to localStorage for future reference
            localStorage.setItem('bam_preload_done', Date.now().toString())

            // Small delay before completing for smooth transition
            setTimeout(() => {
                onComplete()
            }, 300)
        }

        preloadData()
    }, [queryClient, onComplete])

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f8f6f6] to-white flex flex-col items-center justify-center p-6">
            {/* Logo */}
            <div className="mb-8 animate-pulse">
                <div className="size-20 flex items-center justify-center bg-[#ec1325]/10 rounded-2xl">
                    <span className="material-symbols-outlined text-[#ec1325] text-5xl">
                        account_tree
                    </span>
                </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-[#181112] mb-2">BAM Portal</h1>
            <p className="text-sm text-[#896165] mb-8">Keluarga Besar Bani Abu Mansyur</p>

            {/* Progress Bar */}
            <div className="w-full max-w-xs">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                    <div
                        className="h-full bg-[#ec1325] rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-xs text-[#896165] text-center">{loadingText}</p>
            </div>
        </div>
    )
}
