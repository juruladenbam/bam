import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

interface Branch {
    id: number;
    name: string;
    order: number;
    description: string;
    persons_count: number;
}

interface Value {
    icon: string;
    title: string;
    description: string;
}

interface AboutContent {
    title: string;
    subtitle: string;
    biography_title: string;
    biography_content: string;
    values: Value[];
    branches: Branch[];
    total_members: number;
    total_branches: number;
}

export function useAboutContent() {
    return useQuery({
        queryKey: ['about'],
        queryFn: async () => {
            const response = await apiClient.get<{ success: boolean; data: AboutContent }>('/guest/about');
            return response.data.data;
        },
        staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    });
}
