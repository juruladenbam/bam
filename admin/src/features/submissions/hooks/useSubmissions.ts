import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { submissionApi, type SubmissionFilters } from '../api/submissionApi'

/**
 * Hook to fetch submissions list
 */
export function useSubmissions(filters: SubmissionFilters = {}) {
    return useQuery({
        queryKey: ['submissions', filters],
        queryFn: () => submissionApi.getSubmissions(filters),
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
 * Hook to approve a submission
 */
export function useApproveSubmission() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
            submissionApi.approve(id, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['submissions'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        },
    })
}

/**
 * Hook to reject a submission
 */
export function useRejectSubmission() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, reason }: { id: number; reason: string }) =>
            submissionApi.reject(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['submissions'] })
        },
    })
}
