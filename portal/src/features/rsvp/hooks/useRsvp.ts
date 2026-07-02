import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rsvpApi } from '../api/rsvpApi'
import type { RsvpSubmitData } from '../types'

export function useRsvpParticipants(eventIdOrSlug: string | number) {
    return useQuery({
        queryKey: ['rsvp', 'participants', eventIdOrSlug],
        queryFn: () => rsvpApi.getParticipants(eventIdOrSlug),
        enabled: !!eventIdOrSlug,
    })
}

export function useSubmitRsvp(eventIdOrSlug: string | number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: RsvpSubmitData) => rsvpApi.submitRsvp(eventIdOrSlug, data),
        onSuccess: () => {
            // Invalidate participants list query
            queryClient.invalidateQueries({ queryKey: ['rsvp', 'participants', eventIdOrSlug] })
        }
    })
}

export function useSearchPersonsAdvanced(params: { q?: string; branch_id?: number | string; generation?: number | string }) {
    const hasQuery = !!params.q && params.q.length >= 2
    const hasFilters = !!params.branch_id || !!params.generation
    const shouldFetch = hasQuery || hasFilters

    return useQuery({
        queryKey: ['rsvp', 'persons', 'search-advanced', params],
        queryFn: () => rsvpApi.searchPersonsAdvanced(params),
        enabled: shouldFetch,
        staleTime: 5000,
    })
}
