import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()
  const { token, user, isAuthenticated } = storeToRefs(authStore)

  return {
    token,
    user,
    isAuthenticated,
    login: authStore.login,
    register: authStore.register,
    logout: authStore.logout,
  }
}

