import type { PaginatedResponse, User } from '@/types'
import { client } from './client'

export interface UserSearchParams {
  search?: string
  per_page?: number
}

export const usersApi = {
  search: (params: UserSearchParams = {}) =>
    client.get<PaginatedResponse<User>>('/api/users', { params }),
}

