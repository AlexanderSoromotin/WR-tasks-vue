import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types'
import { client } from './client'

export const authApi = {
  login: (payload: LoginPayload) =>
    client.post<AuthResponse>('/api/user/login', payload),

  register: (payload: RegisterPayload) =>
    client.post<AuthResponse>('/api/user/registration', payload),
}

