import api from '../../../lib/api'
import type { ApiResponse, Division, DivisionMember } from '../../../types'

export const divisionApi = {
  list: (eventId: number): Promise<ApiResponse<Division[]>> =>
    api.get(`/juruladen/events/${eventId}/divisions`),

  create: (eventId: number, data: { name: string; color?: string; description?: string; sort_order?: number }): Promise<ApiResponse<Division>> =>
    api.post(`/juruladen/events/${eventId}/divisions`, data),

  update: (divisionId: number, data: Partial<{ name: string; color: string; description: string; sort_order: number }>): Promise<ApiResponse<Division>> =>
    api.put(`/juruladen/divisions/${divisionId}`, data),

  delete: (divisionId: number): Promise<ApiResponse<null>> =>
    api.delete(`/juruladen/divisions/${divisionId}`),

  addMember: (divisionId: number, data: { person_id: number; role: 'ketua' | 'anggota'; responsibilities?: string }): Promise<ApiResponse<DivisionMember>> =>
    api.post(`/juruladen/divisions/${divisionId}/members`, data),

  removeMember: (divisionId: number, personId: number): Promise<ApiResponse<null>> =>
    api.delete(`/juruladen/divisions/${divisionId}/members/${personId}`),
}
