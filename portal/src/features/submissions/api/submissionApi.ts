import { fetchApi } from '../../silsilah/api/silsilahApi'

export interface Submission {
    id: number
    user_id: number
    type: 'birth' | 'marriage' | 'death' | 'correction'
    data: Record<string, any>
    status: 'pending' | 'approved' | 'rejected'
    admin_notes: string | null
    reviewed_at: string | null
    created_at: string
    updated_at: string
}

export interface CreateSubmissionData {
    type: 'birth' | 'marriage' | 'death' | 'correction'
    data: Record<string, any>
}

export const submissionApi = {
    /**
     * Get my submissions
     */
    getMySubmissions: () =>
        fetchApi<Submission[]>('/portal/submissions'),

    /**
     * Get submission detail
     */
    getSubmission: (id: number) =>
        fetchApi<Submission>(`/portal/submissions/${id}`),

    /**
     * Create new submission
     */
    createSubmission: (data: CreateSubmissionData) =>
        fetchApi<Submission>('/portal/submissions', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
}

export default submissionApi
