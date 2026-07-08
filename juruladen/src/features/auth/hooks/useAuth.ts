import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import type { AuthResult } from '../../../types'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const saveAuth = (result: AuthResult) => {
    localStorage.setItem('juruladen_token', result.token)
    localStorage.setItem('juruladen_user', JSON.stringify(result.user))
  }

  const clearAuth = () => {
    localStorage.removeItem('juruladen_token')
    localStorage.removeItem('juruladen_user')
    queryClient.clear()
  }

  const checkNibMutation = useMutation({
    mutationFn: (nib: string) => authApi.checkNib(nib),
  })

  const setPasswordMutation = useMutation({
    mutationFn: ({ nib, email, password, passwordConfirmation }: { nib: string; email: string; password: string; passwordConfirmation: string }) =>
      authApi.setPassword(nib, email, password, passwordConfirmation),
    onSuccess: (data) => {
      saveAuth(data.data)
    },
  })

  const loginMutation = useMutation({
    mutationFn: ({ nib, password }: { nib: string; password: string }) =>
      authApi.login(nib, password),
    onSuccess: (data) => {
      saveAuth(data.data)
    },
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: (nib: string) => authApi.forgotPassword(nib),
  })

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth()
      navigate('/login')
    },
  })

  return {
    checkNib: checkNibMutation,
    setPassword: setPasswordMutation,
    login: loginMutation,
    forgotPassword: forgotPasswordMutation,
    logout: logoutMutation,
    saveAuth,
    clearAuth,
    isAuthenticated: !!localStorage.getItem('juruladen_token'),
    user: JSON.parse(localStorage.getItem('juruladen_user') || 'null'),
  }
}
