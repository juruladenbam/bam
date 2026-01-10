import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'

export interface CalendarDay {
    date: string
    day: number
    hijri: {
        day: number
        month: number
        month_name: string
        year: number
    }
    hijri_formatted: string
    weton: string
    pasaran: string
}

export interface CalendarEvent {
    id: number
    type: 'family' | 'islamic' | 'commemoration'
    title: string
    date: string
    slug?: string
    start_date?: string
    end_date?: string
    location?: string
    thumbnail?: string
    label?: string
    person_name?: string
    hijri_date?: string
    commemoration_type?: string
}

export interface CalendarData {
    year: number
    month: number
    hijri_offset: number
    hijri_month: {
        start: {
            year: number
            month: number
            month_name: string
        }
        end: {
            year: number
            month: number
            month_name: string
        }
        same_month: boolean
    }
    days: CalendarDay[]
    events: {
        family: CalendarEvent[]
        islamic: CalendarEvent[]
        commemorations: CalendarEvent[]
    }
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function fetchCalendar(year: number, month: number): Promise<CalendarData> {
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

// Helper to calculate adjacent months
function getAdjacentMonth(year: number, month: number, direction: 'prev' | 'next'): { year: number; month: number } {
    if (direction === 'prev') {
        return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
    }
    return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }
}

export function useCalendar(year: number, month: number) {
    return useQuery({
        queryKey: ['calendar', year, month],
        queryFn: () => fetchCalendar(year, month),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// Hook to prefetch adjacent months (prev and next)
export function usePrefetchAdjacentMonths(year: number, month: number) {
    const queryClient = useQueryClient()

    const prefetchMonth = useCallback((targetYear: number, targetMonth: number) => {
        queryClient.prefetchQuery({
            queryKey: ['calendar', targetYear, targetMonth],
            queryFn: () => fetchCalendar(targetYear, targetMonth),
            staleTime: 5 * 60 * 1000,
        })
    }, [queryClient])

    useEffect(() => {
        // Prefetch next month first (more likely navigation direction)
        const next = getAdjacentMonth(year, month, 'next')
        prefetchMonth(next.year, next.month)

        // Then prefetch previous month
        const prev = getAdjacentMonth(year, month, 'prev')
        prefetchMonth(prev.year, prev.month)
    }, [year, month, prefetchMonth])
}

