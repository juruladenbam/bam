import apiClient from '@/lib/api';
import type { Event, ApiResponse } from '@/lib/types';

export const eventApi = {
    /**
     * Get list of upcoming public events
     */
    getUpcoming: async (): Promise<ApiResponse<Event[]>> => {
        const response = await apiClient.get('/guest/events');
        return response.data;
    },

    /**
     * Get event detail by slug
     */
    getBySlug: async (slug: string): Promise<ApiResponse<Event>> => {
        const response = await apiClient.get(`/guest/events/${slug}`);
        return response.data;
    },
};

export default eventApi;
