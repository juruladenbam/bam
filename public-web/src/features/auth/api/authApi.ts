import apiClient from '@/lib/api';

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
        token?: string;
    };
}

export const authApi = {
    /**
     * Login user
     */
    login: async (data: LoginData): Promise<AuthResponse> => {
        // Get CSRF cookie first for SPA auth
        await apiClient.get('/sanctum/csrf-cookie', { baseURL: import.meta.env.VITE_API_URL?.replace('/api', '') });
        const response = await apiClient.post('/guest/login', data);
        return response.data;
    },

    /**
     * Register new user
     */
    register: async (data: RegisterData): Promise<AuthResponse> => {
        await apiClient.get('/sanctum/csrf-cookie', { baseURL: import.meta.env.VITE_API_URL?.replace('/api', '') });
        const response = await apiClient.post('/guest/register', data);
        return response.data;
    },
};

export default authApi;
