import { fetchApi } from '../../silsilah/api/silsilahApi'

export interface MediaItem {
    id: number
    file_url: string
    type: 'image' | 'video'
    caption: string
    year: number
    event_name?: string
    created_at: string
}

export interface GalleryFilters {
    type?: 'image' | 'video'
    year?: number
    event_id?: number
    page?: number
    per_page?: number
}

export interface PaginatedResponse<T> {
    data: T[]
    meta: {
        current_page: number
        last_page: number
        per_page: number
        total: number
    }
    links: {
        first: string
        last: string
        prev: string | null
        next: string | null
    }
}

export const galleryApi = {
    /**
     * Get gallery media with filters and pagination
     */
    getMedia: (filters?: GalleryFilters) => {
        const params = new URLSearchParams()
        if (filters?.type) params.append('type', filters.type)
        if (filters?.year) params.append('year', filters.year.toString())
        if (filters?.event_id) params.append('event_id', filters.event_id.toString())
        if (filters?.page) params.append('page', filters.page.toString())
        if (filters?.per_page) params.append('per_page', filters.per_page.toString())

        return fetchApi<PaginatedResponse<MediaItem>>(`/portal/archives?${params.toString()}`)
    },

    /**
     * Get available years for filter
     */
    getYears: () => fetchApi<number[]>('/portal/archives/years'),
}

export default galleryApi
