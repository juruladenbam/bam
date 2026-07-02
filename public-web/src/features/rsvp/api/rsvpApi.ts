import apiClient from '@/lib/api';
import type { ApiResponse } from '@/lib/types';
import type { RsvpParticipant, RsvpSubmitData, RsvpSubmitResponse } from '../types';
import type { Branch } from '@/lib/types';

export const rsvpApi = {
    /**
     * Get list of prepopulated RSVP participants for an event
     */
    getParticipants: async (slug: string): Promise<ApiResponse<RsvpParticipant[]>> => {
        const response = await apiClient.get(`/guest/events/${slug}/rsvp/participants`);
        return response.data;
    },

    /**
     * Get all branches/qobilah
     */
    getBranches: async (): Promise<ApiResponse<Branch[]>> => {
        const response = await apiClient.get('/guest/rsvp/branches');
        return response.data;
    },

    /**
     * Submit RSVP for a participant
     */
    submitRsvp: async (slug: string, data: RsvpSubmitData): Promise<RsvpSubmitResponse> => {
        const response = await apiClient.post(`/guest/events/${slug}/rsvp`, data);
        return response.data;
    },
};

export default rsvpApi;
