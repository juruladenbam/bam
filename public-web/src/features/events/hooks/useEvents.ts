import { useQuery } from '@tanstack/react-query';
import { eventApi } from '../api/eventApi';

/**
 * Hook to fetch upcoming public events
 */
export function useEvents() {
    return useQuery({
        queryKey: ['events', 'public'],
        queryFn: eventApi.getUpcoming,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to fetch single event by slug
 */
export function useEvent(slug: string) {
    return useQuery({
        queryKey: ['events', 'public', slug],
        queryFn: () => eventApi.getBySlug(slug),
        enabled: !!slug,
    });
}
