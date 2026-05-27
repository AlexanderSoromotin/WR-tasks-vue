import { defineStore } from 'pinia'
import { ref } from 'vue'
import { tasksApi } from '@/api/tasks'
import type {
  CreateTaskPayload,
  PaginatedResponse,
  Task,
  TaskFilters,
  UpdateTaskPayload,
} from '@/types'

const defaultMeta: PaginatedResponse<Task>['meta'] = {
  current_page: 1,
  from: 0,
  last_page: 1,
  per_page: 10,
  to: 0,
  total: 0,
}

export const useTasksStore = defineStore('tasks', () => {
  const filters = ref<TaskFilters>({ page: 1, per_page: 10 })
  const tasks = ref<Task[]>([])
  const meta = ref<PaginatedResponse<Task>['meta']>(defaultMeta)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTasks(override: TaskFilters = {}) {
    isLoading.value = true
    error.value = null

    try {
      filters.value = { ...filters.value, ...override }
      const { data } = await tasksApi.getAll(filters.value)
      tasks.value = data.data
      meta.value = data.meta
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось загрузить задачи'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createTask(payload: CreateTaskPayload) {
    isLoading.value = true
    error.value = null

    try {
      await tasksApi.create(payload)
      await fetchTasks()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось создать задачу'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateTask(id: string, payload: UpdateTaskPayload) {
    isLoading.value = true
    error.value = null

    try {
      await tasksApi.update(id, payload)
      await fetchTasks()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось обновить задачу'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteTask(id: string) {
    isLoading.value = true
    error.value = null

    try {
      await tasksApi.remove(id)
      await fetchTasks()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось удалить задачу'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    filters,
    tasks,
    meta,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  }
})

