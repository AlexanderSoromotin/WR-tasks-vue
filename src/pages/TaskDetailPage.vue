<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import TaskForm from '@/components/tasks/TaskForm.vue'
import { useTask } from '@/composables/useTask'
import { useAuthStore } from '@/stores/auth'
import { tasksApi } from '@/api/tasks'
import { formatDate } from '@/utils/date'
import { extractApiErrors } from '@/utils/errors'
import type { UpdateTaskPayload } from '@/types'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const confirm = useConfirm()
const toast = useToast()

const id = String(route.params.id)
const { task, isLoading, error, refresh } = useTask(id)

const showEditDialog = ref(false)
const editErrors = ref<Record<string, string[]>>({})
const editLoading = ref(false)
const completeLoading = ref(false)

const canEdit = computed(
  () => authStore.user?.id !== undefined && authStore.user.id === task.value?.creator_user.id,
)

const canComplete = computed(
  () =>
    authStore.user?.id !== undefined &&
    authStore.user.id === task.value?.responsible_user.id &&
    !task.value?.completed_at,
)

const breadcrumbHome = { icon: 'pi pi-home', command: () => router.push('/') }
const breadcrumbItems = computed(() => [
  { label: 'Задачи', command: () => router.push('/') },
  { label: task.value?.title ?? '...' },
])

const createdAt = computed(() => formatDate(task.value?.created_at ?? null))
const dueAt = computed(() => formatDate(task.value?.complete_at ?? null))
const completedAt = computed(() => formatDate(task.value?.completed_at ?? null))

const dueDate = computed(() => task.value?.complete_at ? new Date(task.value.complete_at) : null)
const isCompleted = computed(() => !!task.value?.completed_at)
const isOverdue = computed(() => !isCompleted.value && dueDate.value !== null && dueDate.value < new Date())

type TagSeverity = 'secondary' | 'info' | 'danger' | 'success'
const statusTag = computed<{ label: string; severity: TagSeverity }>(() => {
  if (isCompleted.value) return { label: 'Завершена', severity: 'success' }
  if (!task.value?.complete_at) return { label: 'Без срока', severity: 'secondary' }
  if (isOverdue.value) return { label: 'Просрочена', severity: 'danger' }
  return { label: 'Активна', severity: 'info' }
})

const userInitials = (name: string) =>
  name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')

onMounted(() => void refresh())

const editInitialValues = computed<Partial<UpdateTaskPayload>>(() => ({
  title: task.value?.title,
  description: task.value?.description ?? undefined,
  responsible_user_id: task.value?.responsible_user.id,
  complete_at: task.value?.complete_at?.slice(0, 10) ?? undefined,
}))

async function saveTask(payload: UpdateTaskPayload) {
  editLoading.value = true
  editErrors.value = {}
  try {
    const { data } = await tasksApi.update(id, payload)
    task.value = data
    showEditDialog.value = false
    toast.add({ severity: 'success', summary: 'Готово', detail: 'Задача обновлена', life: 4000 })
  } catch (err) {
    const apiError = extractApiErrors(err)
    editErrors.value = apiError.errors ?? {}
    toast.add({ severity: 'error', summary: 'Ошибка', detail: apiError.message, life: 4000 })
  } finally {
    editLoading.value = false
  }
}

async function completeTask() {
  completeLoading.value = true
  try {
    const { data } = await tasksApi.complete(id)
    task.value = data
    toast.add({ severity: 'success', summary: 'Готово', detail: 'Задача завершена', life: 4000 })
  } catch (err) {
    const apiError = extractApiErrors(err)
    toast.add({ severity: 'error', summary: 'Ошибка', detail: apiError.message, life: 4000 })
  } finally {
    completeLoading.value = false
  }
}

function deleteTask() {
  confirm.require({
    message: 'Задача будет удалена без возможности восстановления.',
    header: 'Удалить задачу?',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Удалить',
    rejectLabel: 'Отмена',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await tasksApi.remove(id)
        toast.add({ severity: 'success', summary: 'Готово', detail: 'Задача удалена', life: 3000 })
        await router.push('/')
      } catch (err) {
        const apiError = extractApiErrors(err)
        toast.add({ severity: 'error', summary: 'Ошибка', detail: apiError.message, life: 4000 })
      }
    },
  })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Breadcrumb -->
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="!bg-transparent !p-0 !border-0" />

    <!-- Loading -->
    <div v-if="isLoading" class="detail-card">
      <Skeleton height="32px" width="60%" class="mb-4" />
      <Skeleton height="16px" width="40%" class="mb-2" />
      <Skeleton height="16px" width="30%" />
    </div>

    <!-- Error -->
    <Message v-else-if="error" severity="error">{{ error }}</Message>

    <!-- Content -->
    <template v-else-if="task">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div class="flex flex-col gap-2">
          <h1 class="text-[28px] font-bold text-gray-900 leading-tight">{{ task.title }}</h1>
          <div class="flex items-center gap-3 flex-wrap">
            <Tag :value="statusTag.label" :severity="statusTag.severity" />
            <span class="flex items-center gap-1 text-sm text-gray-500">
              <span class="pi pi-calendar text-xs"></span>
              Создана: {{ createdAt }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Button
            v-if="canComplete"
            label="Завершить"
            icon="pi pi-check"
            severity="success"
            :loading="completeLoading"
            @click="completeTask"
          />
          <template v-if="canEdit">
            <Button
              label="Редактировать"
              icon="pi pi-pencil"
              severity="secondary"
              outlined
              @click="showEditDialog = true"
            />
            <Button
              label="Удалить"
              icon="pi pi-trash"
              severity="danger"
              text
              @click="deleteTask"
            />
          </template>
        </div>
      </div>

      <!-- Two-column layout -->
      <div class="detail-layout">
        <!-- Description -->
        <div class="detail-card">
          <h2 class="text-[15px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Описание</h2>
          <p v-if="task.description" class="text-[15px] text-gray-700 leading-relaxed whitespace-pre-wrap">
            {{ task.description }}
          </p>
          <p v-else class="text-sm text-gray-400 italic">Описание не указано</p>
        </div>

        <!-- Sidebar -->
        <aside class="flex flex-col gap-0">
          <!-- Responsible -->
          <div class="sidebar-row">
            <span class="sidebar-label">Ответственный</span>
            <div class="flex items-center gap-2">
              <Avatar :label="userInitials(task.responsible_user.name)" shape="circle" class="bg-blue-50 text-blue-700 text-sm font-semibold shrink-0" />
              <div>
                <p class="text-[15px] text-gray-900 font-medium">{{ task.responsible_user.name }}</p>
                <p class="text-xs text-gray-500">{{ task.responsible_user.email }}</p>
              </div>
            </div>
          </div>

          <Divider class="!my-0" />

          <!-- Creator -->
          <div class="sidebar-row">
            <span class="sidebar-label">Постановщик</span>
            <div class="flex items-center gap-2">
              <Avatar :label="userInitials(task.creator_user.name)" shape="circle" class="bg-gray-100 text-gray-600 text-sm font-semibold shrink-0" />
              <div>
                <p class="text-[15px] text-gray-900 font-medium">{{ task.creator_user.name }}</p>
                <p class="text-xs text-gray-500">{{ task.creator_user.email }}</p>
              </div>
            </div>
          </div>

          <Divider class="!my-0" />

          <!-- Due date -->
          <div class="sidebar-row">
            <span class="sidebar-label">Срок выполнения</span>
            <p
              class="text-[15px] font-medium"
              :class="isOverdue ? 'text-red-500' : 'text-gray-900'"
            >
              {{ dueAt }}
            </p>
          </div>

          <Divider class="!my-0" />

          <!-- Completed at -->
          <div class="sidebar-row">
            <span class="sidebar-label">Завершена</span>
            <p class="text-[15px] font-medium" :class="isCompleted ? 'text-green-600' : 'text-gray-400 italic text-sm'">
              {{ completedAt ?? 'Не завершена' }}
            </p>
          </div>

          <Divider class="!my-0" />

          <!-- Created at -->
          <div class="sidebar-row">
            <span class="sidebar-label">Дата создания</span>
            <p class="text-[15px] text-gray-900">{{ createdAt }}</p>
          </div>
        </aside>
      </div>
    </template>
  </div>

  <!-- Edit dialog -->
  <Dialog
    v-model:visible="showEditDialog"
    header="Редактировать задачу"
    :style="{ width: '560px', borderRadius: '16px' }"
    modal
    @hide="editErrors = {}"
  >
    <TaskForm
      :initial-values="editInitialValues"
      :initial-responsible-user="task?.responsible_user ?? null"
      :is-loading="editLoading"
      :errors="editErrors"
      submit-label="Сохранить изменения"
      @submit="saveTask"
      @cancel="showEditDialog = false"
    />
  </Dialog>
</template>

<style scoped>
.detail-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  align-items: start;
}

.detail-card {
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
}

.sidebar-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 0;
}

.sidebar-label {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9CA3AF;
}

@media (max-width: 768px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
}
</style>

