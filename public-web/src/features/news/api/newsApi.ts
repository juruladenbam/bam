import apiClient from '@/lib/api';
import type { NewsItem, PaginatedResponse, ApiResponse } from '@/lib/types';

export const newsApi = {
    /**
     * Get list of public news articles
     */
    getList: async (page: number = 1): Promise<PaginatedResponse<NewsItem>> => {
        const response = await apiClient.get('/guest/news', { params: { page } });
        return response.data;
    },

    getHeadlines: async (): Promise<ApiResponse<NewsItem[]>> => {
        const response = await apiClient.get('/guest/news/headlines');
        return response.data;
    },

    /**
     * Get news detail by slug
     */
    getBySlug: async (slug: string): Promise<{ success: boolean; data: NewsItem }> => {
        const response = await apiClient.get(`/guest/news/${slug}`);
        return response.data;
    },

    clap: async (id: number): Promise<any> => {
        const response = await apiClient.post(`/guest/news/${id}/clap`);
        return response.data;
    },
};

export default newsApi;
