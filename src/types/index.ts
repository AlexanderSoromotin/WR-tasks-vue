export interface User {
  id: string
  name: string
  email: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  complete_at: string | null
  completed_at: string | null
  created_at: string
  responsible_user: User
  creator_user: User
}

export interface PaginatedResponse<T> {
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  }
}

export interface TaskFilters {
  title?: string
  responsible_user_id?: string
  creator_user_id?: string
  created_from?: string
  created_to?: string
  complete_from?: string
  complete_to?: string
  per_page?: number
  page?: number
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface CreateTaskPayload {
  title: string
  description?: string | null
  responsible_user_id: string
  complete_at?: string | null
}

export interface UpdateTaskPayload {
  title?: string
  description?: string | null
  responsible_user_id?: string
  complete_at?: string | null
}

export interface ApiValidationError {
  message: string
  errors?: Record<string, string[]>
}

