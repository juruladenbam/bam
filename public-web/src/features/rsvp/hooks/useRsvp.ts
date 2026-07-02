import { useQuery, useMutation } from '@tanstack/react-query';
import { rsvpApi } from '../api/rsvpApi';
import type { RsvpSubmitData } from '../types';

/**
 * Hook to fetch RSVP participants
 */
export function useRsvpParticipants(slug: string) {
    return useQuery({
        queryKey: ['rsvp', 'participants', slug],
        queryFn: () => rsvpApi.getParticipants(slug),
        enabled: !!slug,
    });
}

/**
 * Hook to fetch branches/qobilah
 */
export function useRsvpBranches() {
    return useQuery({
        queryKey: ['rsvp', 'branches'],
        queryFn: rsvpApi.getBranches,
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
}

/**
 * Hook to submit RSVP
 */
export function useSubmitRsvp(slug: string) {
    return useMutation({
        mutationFn: (data: RsvpSubmitData) => rsvpApi.submitRsvp(slug, data),
    });
}
