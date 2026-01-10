import { useQuery } from '@tanstack/react-query'

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
        year: number
        month: number
        month_name: string
    }
    days: CalendarDay[]
    events: {
        family: CalendarEvent[]
        islamic: CalendarEvent[]
        commemorations: CalendarEvent[]
    }
}

async function fetchCalendar(year: number, month: number): Promise<CalendarData> {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
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

export function useCalendar(year: number, month: number) {
    return useQuery({
        queryKey: ['calendar', year, month],
        queryFn: () => fetchCalendar(year, month),
    })
}
