import { useQuery } from '@tanstack/react-query'
import { galleryApi, type GalleryFilters } from '../api/galleryApi'

/**
 * Hook to fetch gallery media with filters
 */
export function useGallery(filters?: GalleryFilters) {
    return useQuery({
        queryKey: ['gallery', filters],
        queryFn: () => galleryApi.getMedia(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

/**
 * Hook to fetch available years for gallery filter
 */
export function useGalleryYears() {
    return useQuery({
        queryKey: ['gallery', 'years'],
        queryFn: galleryApi.getYears,
        staleTime: 1000 * 60 * 30, // 30 minutes
    })
}
