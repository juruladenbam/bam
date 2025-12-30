import { fetchApi } from '../../silsilah/api/silsilahApi'

// Re-using types or defining simplified view types
export interface NewsItem {
    id: number
    title: string
    slug: string
    category: string
    published_at: string
    author: { name: string }
    thumbnail?: string
    content?: string // HTML content
    claps?: number
}

export interface EventSchedule {
    id: number
    day_sequence: number
    title: string
    time_start: string
    time_end: string | null
    description: string | null
}

export interface SidebarItem {
    id: string
    type: 'button' | 'info'
    label: string
    icon?: string
    value?: string
    description?: string
}

export interface EventItem {
    id: number
    name: string
    type: string
    start_date: string
    end_date: string
    location_name: string
    location_maps_url?: string
    description: string
    slug: string
    schedules?: EventSchedule[]
    meta_data?: SidebarItem[]
}

export interface MediaItem {
    id: number
    file_url: string
    type: 'image' | 'video'
    caption: string
    year: number
}

export interface HomeData {
    news: NewsItem[]
    upcoming_events: EventItem[]
    stats?: any
}

export const contentApi = {
    getHomeData: () => fetchApi<HomeData>('/portal/home'),

    getEvents: (type: 'upcoming' | 'past' = 'upcoming') =>
        fetchApi<EventItem[]>(`/portal/events?type=${type}`),

    getEventDetail: (id: number) => fetchApi<EventItem>(`/portal/events/${id}`),

    getNewsDetail: (id: number) => fetchApi<NewsItem>(`/portal/news/${id}`),

    clapNews: (id: number) => fetchApi<{ claps: number }>(`/portal/news/${id}/clap`, {
        method: 'POST'
    }),

    getEvent: (id: number) => fetchApi<EventItem>(`/portal/events/${id}`),

    getArchives: (params?: { type?: string, year?: number }) => {
        const query = new URLSearchParams(params as any).toString()
        return fetchApi<{ data: MediaItem[], links: any, meta: any }>(`/portal/archives?${query}`)
    }
}
