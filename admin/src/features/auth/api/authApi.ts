import api from '../../../lib/api'
import type { LoginCredentials, ApiResponse, User } from '../../../types'

export const authApi = {
    login: async (credentials: LoginCredentials) => {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
        // Get CSRF cookie from the root domain of the API (remove /api)
        await api.get('/sanctum/csrf-cookie', { baseURL: baseURL.replace(/\/api$/, '') })
        return api.post<any, ApiResponse<{ user: User }>>('/guest/login', credentials, {
            baseURL: baseURL
        })
    },
    logout: async () => {
        return api.post('/logout')
    },
    getMe: async () => {
        return api.get<any, ApiResponse<{ user: User }>>('/me')
    }
}
