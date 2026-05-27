import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi } from '@/api/auth'
import type { LoginPayload, RegisterPayload, User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(
    JSON.parse(localStorage.getItem('user') ?? 'null') as User | null,
  )

  const isAuthenticated = computed(() => token.value !== null)

  async function login(payload: LoginPayload) {
    const { data } = await authApi.login(payload)
    persist(data.token, data.user)
  }

  async function register(payload: RegisterPayload) {
    const { data } = await authApi.register(payload)
    persist(data.token, data.user)
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function persist(newToken: string, newUser: User) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  return { token, user, isAuthenticated, login, register, logout }
})

