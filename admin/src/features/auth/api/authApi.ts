import api from '../../../lib/api'
import type { LoginCredentials, ApiResponse, User } from '../../../types'

export const authApi = {
    login: async (credentials: LoginCredentials) => {
        await api.get('/sanctum/csrf-cookie', { baseURL: '/' })
        return api.post<any, ApiResponse<{ user: User }>>('/guest/login', credentials, {
            baseURL: '/api'
        })
    },
    logout: async () => {
        return api.post('/logout')
    },
    getMe: async () => {
        return api.get<any, ApiResponse<{ user: User }>>('/me')
    }
}
