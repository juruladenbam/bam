import { useQuery } from '@tanstack/react-query';
import { newsApi } from '../api/newsApi';

/**
 * Hook to fetch public news list
 */
export function useNews(page: number = 1) {
    return useQuery({
        queryKey: ['news', 'public', page],
        queryFn: () => newsApi.getList(page),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to fetch headlines
 */
export function useNewsHeadlines() {
    return useQuery({
        queryKey: ['news', 'headlines'],
        queryFn: newsApi.getHeadlines,
    });
}

/**
 * Hook to fetch single news by slug
 */
export function useNewsItem(slug: string) {
    return useQuery({
        queryKey: ['news', 'public', slug],
        queryFn: () => newsApi.getBySlug(slug),
        enabled: !!slug,
    });
}
