import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export interface PortalMode {
    login_enabled: boolean;
    nib_claiming_enabled: boolean;
}

export function usePortalMode() {
    return useQuery({
        queryKey: ['portal-mode'],
        queryFn: async () => {
            const response = await apiClient.get<PortalMode>('/portal/settings/mode');
            return response.data;
        },
        staleTime: 1000 * 60 * 5, // 5 mins
        retry: 1,
    });
}
