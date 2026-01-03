import apiClient from '@/lib/api';
import type { NewsItem, PaginatedResponse } from '@/lib/types';

export const newsApi = {
    /**
     * Get list of public news articles
     */
    getList: async (page: number = 1): Promise<PaginatedResponse<NewsItem>> => {
        const response = await apiClient.get('/guest/news', { params: { page } });
        return response.data;
    },

    /**
     * Get news detail by slug
     */
    getBySlug: async (slug: string): Promise<{ success: boolean; data: NewsItem }> => {
        const response = await apiClient.get(`/guest/news/${slug}`);
        return response.data;
    },
};

export default newsApi;
