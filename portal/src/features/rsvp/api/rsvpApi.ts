import { fetchApi } from '../../silsilah/api/silsilahApi'
import type { RsvpParticipant, RsvpSubmitData, RsvpSubmitResponse } from '../types'
import type { Person } from '../../silsilah/types'

export const rsvpApi = {
    getParticipants: (eventIdOrSlug: string | number) =>
        fetchApi<RsvpParticipant[]>(`/portal/events/${eventIdOrSlug}/rsvp/participants`),

    submitRsvp: (eventIdOrSlug: string | number, data: RsvpSubmitData) =>
        fetchApi<RsvpSubmitResponse>(`/portal/events/${eventIdOrSlug}/rsvp`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    searchPersonsAdvanced: (params: { q?: string; branch_id?: number | string; generation?: number | string }) => {
        const queryParams = new URLSearchParams()
        if (params.q) queryParams.append('q', params.q)
        if (params.branch_id) queryParams.append('branch_id', String(params.branch_id))
        if (params.generation) queryParams.append('generation', String(params.generation))
        return fetchApi<Person[]>(`/portal/persons/search-advanced?${queryParams.toString()}`)
    }
}
