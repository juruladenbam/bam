import api from '../../../lib/api'

export interface Submission {
    id: number
    user_id: number
    type: 'birth' | 'marriage' | 'death' | 'correction'
    data: Record<string, any>
    status: 'pending' | 'approved' | 'rejected'
    admin_notes: string | null
    reviewed_by: number | null
    reviewed_at: string | null
    created_at: string
    updated_at: string
    user?: {
        id: number
        name: string
        email: string
    }
    reviewer?: {
        id: number
        name: string
    }
}

export interface SubmissionFilters {
    status?: 'pending' | 'approved' | 'rejected'
    type?: 'birth' | 'marriage' | 'death' | 'correction'
    per_page?: number
    page?: number
}

export interface PaginatedSubmissions {
    success: boolean
    message: string
    data: Submission[]
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

export const submissionApi = {
    /**
     * Get list of submissions with filters
     */
    getSubmissions: async (filters: SubmissionFilters = {}): Promise<PaginatedSubmissions> => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) params.append(key, String(value))
        })
        return api.get(`/submissions?${params.toString()}`) as unknown as PaginatedSubmissions
    },

    /**
     * Get submission detail
     */
    getSubmission: async (id: number): Promise<ApiResponse<Submission>> => {
        return api.get(`/submissions/${id}`) as unknown as ApiResponse<Submission>
    },

    /**
     * Approve a submission
     */
    approve: async (id: number, notes?: string): Promise<ApiResponse<Submission>> => {
        return api.post(`/submissions/${id}/approve`, { notes }) as unknown as ApiResponse<Submission>
    },

    /**
     * Reject a submission
     */
    reject: async (id: number, reason: string): Promise<ApiResponse<Submission>> => {
        return api.post(`/submissions/${id}/reject`, { reason }) as unknown as ApiResponse<Submission>
    },
}

export default submissionApi
