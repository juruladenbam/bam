import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { useNavigate } from 'react-router-dom'
import type { ApiResponse, User } from '../../../types'

export const useUser = () => {
    return useQuery({
        queryKey: ['auth', 'user'],
        queryFn: authApi.getMe,
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export const useLogin = () => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: authApi.login,
        onSuccess: (response: ApiResponse<{ user: User }>) => {
            queryClient.setQueryData(['auth', 'user'], response)
            navigate('/')
        }
    })
}

export const useLogout = () => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: authApi.logout,
        onSuccess: () => {
            queryClient.setQueryData(['auth', 'user'], null)
            queryClient.clear()
            navigate('/login')
        }
    })
}
