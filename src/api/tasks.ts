import type {
  CreateTaskPayload,
  PaginatedResponse,
  Task,
  TaskFilters,
  UpdateTaskPayload,
} from '@/types'
import { client } from './client'

export const tasksApi = {
  getAll: (filters: TaskFilters = {}) =>
    client.get<PaginatedResponse<Task>>('/api/tasks', { params: filters }),

  getOne: (id: string) => client.get<Task>(`/api/tasks/${id}`),

  create: (payload: CreateTaskPayload) => client.post<Task>('/api/tasks', payload),

  update: (id: string, payload: UpdateTaskPayload) =>
    client.patch<Task>(`/api/tasks/${id}`, payload),

  remove: (id: string) => client.delete(`/api/tasks/${id}`),

  complete: (id: string) => client.patch<Task>(`/api/tasks/${id}/complete`),
}

