import api from '../../../lib/api'

export interface SidebarItem {
    id: string
    type: 'button' | 'info'
    label: string
    icon?: string
    value?: string
    description?: string
}

export interface Event {
    id: number
    name: string
    thumbnail?: string
    type: 'festival' | 'halal_bihalal' | 'youth_camp' | 'other'
    year: number
    start_date: string
    end_date: string
    description?: string
    location_name?: string
    location_maps_url?: string
    is_active: boolean
    created_at: string
    schedules?: EventSchedule[]
    meta_data?: SidebarItem[]
}

export type CreateEventData = Omit<Event, 'id' | 'created_at'>
export type UpdateEventData = Partial<CreateEventData>

export interface EventSchedule {
    id: number
    event_id: number
    day_sequence: number
    title: string
    time_start: string
    time_end: string | null
    description: string | null
}

export type CreateScheduleData = Omit<EventSchedule, 'id' | 'event_id'>
export type UpdateScheduleData = Partial<CreateScheduleData>

export interface NewsPost {
    id: number
    slug: string
    title: string
    thumbnail?: string
    description?: string // Short excerpt
    content: string
    category: 'kelahiran' | 'lelayu' | 'prestasi' | 'umum'
    is_public: boolean
    published_at: string
    author?: {
        id: number
        name: string
    }
    created_at: string
}

export type CreateNewsData = Omit<NewsPost, 'id' | 'slug' | 'author' | 'created_at'>
export type UpdateNewsData = Partial<CreateNewsData>

export interface MediaGallery {
    id: number
    file_url: string
    type: 'image' | 'video'
    caption?: string
    year?: number
    event_id?: number
    uploader?: {
        id: number
        name: string
    }
    created_at: string
}

export type CreateMediaData = Omit<MediaGallery, 'id' | 'uploader' | 'created_at'>

export const contentApi = {
    // Events
    getEvents: (params?: any) => api.get('/events', { params }).then((res: any) => res.data),
    getEvent: (id: number) => api.get(`/events/${id}`).then((res: any) => res.data),
    createEvent: (data: CreateEventData) => api.post('/events', data).then((res: any) => res.data),
    updateEvent: (id: number, data: UpdateEventData) => api.put(`/events/${id}`, data).then((res: any) => res.data),
    deleteEvent: (id: number) => api.delete(`/events/${id}`).then((res: any) => res.data),

    // Event Schedules
    createSchedule: (eventId: number, data: CreateScheduleData) =>
        api.post(`/events/${eventId}/schedules`, data).then((res: any) => res.data),
    updateSchedule: (eventId: number, scheduleId: number, data: UpdateScheduleData) =>
        api.put(`/events/${eventId}/schedules/${scheduleId}`, data).then((res: any) => res.data),
    deleteSchedule: (eventId: number, scheduleId: number) =>
        api.delete(`/events/${eventId}/schedules/${scheduleId}`).then((res: any) => res.data),

    // News
    getNews: (params?: any) => api.get('/news', { params }).then((res: any) => res.data),
    getNewsDetail: (id: number) => api.get(`/news/${id}`).then((res: any) => res.data),
    createNews: (data: CreateNewsData) => api.post('/news', data).then((res: any) => res.data),
    updateNews: (id: number, data: UpdateNewsData) => api.put(`/news/${id}`, data).then((res: any) => res.data),
    deleteNews: (id: number) => api.delete(`/news/${id}`).then((res: any) => res.data),

    // Media
    getMedia: (params?: any) => api.get('/media', { params }).then((res: any) => res.data),
    createMedia: (data: CreateMediaData) => api.post('/media', data).then((res: any) => res.data),
    deleteMedia: (id: number) => api.delete(`/media/${id}`).then((res: any) => res.data),
}
