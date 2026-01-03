import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi, type UserFilters, type User } from '../api/userApi'

/**
 * Hook to fetch users list
 */
export function useUsers(filters: UserFilters = {}) {
    return useQuery({
        queryKey: ['users', filters],
        queryFn: () => userApi.getUsers(filters),
    })
}

/**
 * Hook to fetch single user
 */
export function useUser(id: number) {
    return useQuery({
        queryKey: ['users', id],
        queryFn: () => userApi.getUser(id),
        enabled: !!id,
    })
}

/**
 * Hook to update a user
 */
export function useUpdateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Pick<User, 'name' | 'role' | 'person_id'>> }) =>
            userApi.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => userApi.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })
}
