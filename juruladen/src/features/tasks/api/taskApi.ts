import api from '../../../lib/api'
import type { ApiResponse, CommitteeTask } from '../../../types'

export const taskApi = {
  list: (divisionId: number, status?: string): Promise<ApiResponse<CommitteeTask[]>> =>
    api.get(`/juruladen/divisions/${divisionId}/tasks`, { params: status ? { status } : {} }),

  create: (divisionId: number, data: Partial<CommitteeTask>): Promise<ApiResponse<CommitteeTask>> =>
    api.post(`/juruladen/divisions/${divisionId}/tasks`, data),

  update: (divisionId: number, taskId: number, data: Partial<CommitteeTask>): Promise<ApiResponse<CommitteeTask>> =>
    api.put(`/juruladen/divisions/${divisionId}/tasks/${taskId}`, data),

  delete: (divisionId: number, taskId: number): Promise<ApiResponse<null>> =>
    api.delete(`/juruladen/divisions/${divisionId}/tasks/${taskId}`),

  updateStatus: (taskId: number, status: CommitteeTask['status']): Promise<ApiResponse<CommitteeTask>> =>
    api.patch(`/juruladen/tasks/${taskId}/status`, { status }),

  reorder: (tasks: { id: number; sort_order: number; status?: CommitteeTask['status'] }[]): Promise<ApiResponse<null>> =>
    api.post('/juruladen/tasks/reorder', { tasks }),
}
