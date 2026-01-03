import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventApi, type EventRegistration } from '../api/eventApi'

/**
 * Hook to fetch upcoming events
 */
export function useEvents(type: 'upcoming' | 'past' = 'upcoming') {
    return useQuery({
        queryKey: ['events', type],
        queryFn: () => eventApi.getEvents(type),
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

/**
 * Hook to fetch single event detail
 */
export function useEventDetail(id: number) {
    return useQuery({
        queryKey: ['events', id],
        queryFn: () => eventApi.getEventDetail(id),
        enabled: !!id,
    })
}

/**
 * Hook to register for an event
 */
export function useEventRegistration() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ eventId, data }: { eventId: number; data: EventRegistration }) =>
            eventApi.register(eventId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] })
        },
    })
}
