import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

client.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  const token = authStore.token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()

      if (router.currentRoute.value.path !== '/login') {
        await router.push('/login')
      }
    }

    return Promise.reject(error)
  },
)


