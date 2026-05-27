import { storeToRefs } from 'pinia'
import { useTasksStore } from '@/stores/tasks'

export function useTasks() {
  const tasksStore = useTasksStore()
  const { filters, tasks, meta, isLoading, error } = storeToRefs(tasksStore)

  return {
    filters,
    tasks,
    meta,
    isLoading,
    error,
    fetchTasks: tasksStore.fetchTasks,
    createTask: tasksStore.createTask,
    updateTask: tasksStore.updateTask,
    deleteTask: tasksStore.deleteTask,
  }
}

