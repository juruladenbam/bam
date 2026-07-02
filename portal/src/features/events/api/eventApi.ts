import { fetchApi } from '../../silsilah/api/silsilahApi'

export interface Event {
    id: number
    name: string
    type: string
    year: number
    start_date: string
    end_date: string
    location_name: string
    location_maps_url?: string
    thumbnail_url?: string
    description: string
    slug: string
    is_active: boolean
    schedules?: EventSchedule[]
    meta_data?: SidebarItem[]
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

export interface EventRegistration {
    event_id: number
    attendee_name: string
    attendee_phone?: string
    notes?: string
}

export const eventApi = {
    /**
     * Get list of events
     */
    getEvents: (type: 'upcoming' | 'past' = 'upcoming') =>
        fetchApi<Event[]>(`/portal/events?type=${type}`),

    /**
     * Get event detail by ID or Slug
     */
    getEventDetail: (idOrSlug: string | number) =>
        fetchApi<Event>(`/portal/events/${idOrSlug}`),

    /**
     * Register for an event
     */
    register: (idOrSlug: string | number, data: EventRegistration) =>
        fetchApi<{ success: boolean }>(`/portal/events/${idOrSlug}/register`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
}

export default eventApi
