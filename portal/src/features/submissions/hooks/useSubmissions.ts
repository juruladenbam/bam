import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { submissionApi, type CreateSubmissionData } from '../api/submissionApi'

/**
 * Hook to fetch user's submissions
 */
export function useMySubmissions() {
    return useQuery({
        queryKey: ['submissions', 'mine'],
        queryFn: submissionApi.getMySubmissions,
    })
}

/**
 * Hook to fetch single submission
 */
export function useSubmission(id: number) {
    return useQuery({
        queryKey: ['submissions', id],
        queryFn: () => submissionApi.getSubmission(id),
        enabled: !!id,
    })
}

/**
 * Hook to create a new submission
 */
export function useCreateSubmission() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateSubmissionData) => submissionApi.createSubmission(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['submissions'] })
        },
    })
}
