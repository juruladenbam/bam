import api from '../../../lib/api'

export interface User {
    id: number
    name: string
    email: string
    role: 'superadmin' | 'admin' | 'member'
    person_id: number | null
    email_verified_at: string | null
    created_at: string
    updated_at: string
    person?: {
        id: number
        full_name: string
        gender: 'male' | 'female'
    }
}

export interface UserFilters {
    search?: string
    role?: 'superadmin' | 'admin' | 'member'
    per_page?: number
    page?: number
}

export interface PaginatedUsers {
    success: boolean
    message: string
    data: User[]
    meta: {
        current_page: number
        last_page: number
        per_page: number
        total: number
    }
}

export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
}

export const userApi = {
    /**
     * Get list of users with filters
     */
    getUsers: async (filters: UserFilters = {}): Promise<PaginatedUsers> => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== '') params.append(key, String(value))
        })
        return api.get(`/users?${params.toString()}`) as unknown as PaginatedUsers
    },

    /**
     * Get user detail
     */
    getUser: async (id: number): Promise<ApiResponse<User>> => {
        return api.get(`/users/${id}`) as unknown as ApiResponse<User>
    },

    /**
     * Update user
     */
    updateUser: async (id: number, data: Partial<Pick<User, 'name' | 'role' | 'person_id'>>): Promise<ApiResponse<User>> => {
        return api.put(`/users/${id}`, data) as unknown as ApiResponse<User>
    },

    /**
     * Delete user
     */
    deleteUser: async (id: number): Promise<ApiResponse<null>> => {
        return api.delete(`/users/${id}`) as unknown as ApiResponse<null>
    },
}

export default userApi
