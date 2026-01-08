import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

interface Feature {
    icon: string;
    title: string;
    description: string;
}

interface HomeContent {
    hero: {
        badge: string;
        title: string;
        subtitle: string;
        image: string;
        image_year: string;
        image_caption: string;
        image_location: string;
    };
    features: {
        title: string;
        subtitle: string;
        items: Feature[];
    };
    legacy: {
        title: string;
        content: string;
        quote: string;
        image: string;
    };
    cta: {
        title: string;
        subtitle: string;
    };
}

export function useHomeContent() {
    return useQuery({
        queryKey: ['home-content'],
        queryFn: async () => {
            const response = await apiClient.get<{ success: boolean; data: HomeContent }>('/guest/home-content');
            return response.data.data;
        },
        staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    });
}
