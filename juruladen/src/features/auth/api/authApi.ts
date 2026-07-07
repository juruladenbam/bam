import api from '../../../lib/api'
import type { ApiResponse, CheckNibResponse, AuthResult } from '../../../types'

export const authApi = {
  checkNib: (nib: string): Promise<ApiResponse<CheckNibResponse>> =>
    api.post('/juruladen/auth/check-nib', { nib }),

  setPassword: (nib: string, email: string, password: string, password_confirmation: string): Promise<ApiResponse<AuthResult>> =>
    api.post('/juruladen/auth/set-password', { nib, email, password, password_confirmation }),

  login: (nib: string, password: string): Promise<ApiResponse<AuthResult>> =>
    api.post('/juruladen/auth/login', { nib, password }),

  forgotPassword: (nib: string): Promise<ApiResponse<null>> =>
    api.post('/juruladen/auth/forgot-password', { nib }),

  logout: (): Promise<ApiResponse<null>> =>
    api.post('/juruladen/auth/logout'),
}
