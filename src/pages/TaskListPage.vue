<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import TaskCard from '@/components/tasks/TaskCard.vue'
import TaskFilters from '@/components/tasks/TaskFilters.vue'
import TaskForm from '@/components/tasks/TaskForm.vue'
import { useTaskFilters } from '@/composables/useTaskFilters'
import { useTasksStore } from '@/stores/tasks'
import { useToast } from 'primevue/usetoast'
import { extractApiErrors } from '@/utils/errors'
import type { CreateTaskPayload, TaskFilters as TaskFiltersType, UpdateTaskPayload } from '@/types'

const tasksStore = useTasksStore()
const { filters, setFilter, resetFilters } = useTaskFilters()
const toast = useToast()

const showCreateDialog = ref(false)
const createErrors = ref<Record<string, string[]>>({})
const createLoading = ref(false)

const pageTitle = computed(() => `Задачи (${tasksStore.meta.total})`)

async function loadTasks() {
  try {
    await tasksStore.fetchTasks(filters.value)
  } catch { /* ошибка в store */ }
}

onMounted(() => void loadTasks())

watch(() => filters.value, async (val) => {
  tasksStore.filters = val
  try {
    await tasksStore.fetchTasks(val)
  } catch { /* ошибка в store */ }
}, { deep: true })

async function updateFilters(nextFilters: TaskFiltersType) {
  const keys = new Set<keyof TaskFiltersType>([
    ...(Object.keys(filters.value) as Array<keyof TaskFiltersType>),
    ...(Object.keys(nextFilters) as Array<keyof TaskFiltersType>),
  ])
  for (const key of keys) {
    if (nextFilters[key] !== filters.value[key]) {
      await setFilter(key, nextFilters[key])
      return
    }
  }
}

async function resetAllFilters() {
  await resetFilters()
}

async function createTask(payload: UpdateTaskPayload) {
  createErrors.value = {}
  createLoading.value = true
  try {
    const p: CreateTaskPayload = {
      title: payload.title ?? '',
      responsible_user_id: payload.responsible_user_id ?? '',
      description: payload.description ?? null,
      complete_at: payload.complete_at ?? null,
    }
    await tasksStore.createTask(p)
    showCreateDialog.value = false
    toast.add({ severity: 'success', summary: 'Готово', detail: 'Задача создана', life: 4000 })
  } catch (err) {
    const apiError = extractApiErrors(err)
    createErrors.value = apiError.errors ?? {}
    toast.add({ severity: 'error', summary: 'Ошибка', detail: apiError.message, life: 4000 })
  } finally {
    createLoading.value = false
  }
}

function onPageChange(event: { first: number; rows: number; page: number }) {
  void setFilter('page', event.page + 1)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Page header -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <h1 class="text-[28px] font-bold text-gray-900 leading-tight">{{ pageTitle }}</h1>
      <Button
        label="Новая задача"
        icon="pi pi-plus"
        @click="showCreateDialog = true"
      />
    </div>

    <!-- Filters -->
    <TaskFilters :filters="filters" @update:filters="updateFilters" @reset="resetAllFilters" />

    <Divider class="!my-0" />

    <!-- Error -->
    <Message v-if="tasksStore.error" severity="error">{{ tasksStore.error }}</Message>

    <!-- Task grid — loading skeletons -->
    <template v-if="tasksStore.isLoading">
      <div class="task-grid">
        <div v-for="i in 9" :key="i" class="skeleton-card">
          <div class="flex justify-between gap-2 mb-3">
            <Skeleton height="14px" width="65%" />
            <Skeleton height="14px" width="20%" border-radius="10px" />
          </div>
          <div class="flex justify-between">
            <Skeleton height="12px" width="40%" />
            <Skeleton height="12px" width="20%" />
          </div>
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <template v-else-if="!tasksStore.isLoading && tasksStore.tasks.length === 0">
      <div class="empty-state">
        <span class="pi pi-inbox" style="font-size: 3rem; color: #D1D5DB;"></span>
        <p class="text-lg font-medium text-gray-400 mt-2">Задачи не найдены</p>
        <p class="text-sm text-gray-400">Попробуйте изменить фильтры или создайте первую задачу.</p>
      </div>
    </template>

    <!-- Task grid -->
    <template v-else>
      <div class="task-grid">
        <TaskCard v-for="task in tasksStore.tasks" :key="task.id" :task="task" />
      </div>
    </template>

    <!-- Pagination -->
    <div v-if="tasksStore.meta.last_page > 1" class="flex justify-center">
      <Paginator
        :rows="filters.per_page ?? 10"
        :total-records="tasksStore.meta.total"
        :first="((tasksStore.meta.current_page - 1) * (filters.per_page ?? 10))"
        :rows-per-page-options="[10, 25, 50]"
        @page="onPageChange"
      />
    </div>
  </div>

  <!-- Create task dialog -->
  <Dialog
    v-model:visible="showCreateDialog"
    header="Новая задача"
    :style="{ width: '560px', borderRadius: '16px' }"
    modal
    @hide="createErrors = {}"
  >
    <TaskForm
      :is-loading="createLoading"
      :errors="createErrors"
      submit-label="Создать задачу"
      @submit="createTask"
      @cancel="showCreateDialog = false"
    />
  </Dialog>
</template>

<style scoped>
.task-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.skeleton-card {
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 14px 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 24px;
  text-align: center;
}

@media (max-width: 900px) {
  .task-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .task-grid {
    grid-template-columns: 1fr;
  }
}
</style>
