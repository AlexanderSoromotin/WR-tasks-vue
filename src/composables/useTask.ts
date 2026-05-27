import { ref, type Ref } from 'vue'
import { tasksApi } from '@/api/tasks'
import type { Task } from '@/types'

export function useTask(id: string): {
  task: Ref<Task | null>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  refresh: () => Promise<void>
} {
  const task = ref<Task | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function refresh() {
    isLoading.value = true
    error.value = null

    try {
      const { data } = await tasksApi.getOne(id)
      task.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось загрузить задачу'
    } finally {
      isLoading.value = false
    }
  }

  return { task, isLoading, error, refresh }
}

