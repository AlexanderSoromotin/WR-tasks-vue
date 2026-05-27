<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Task } from '@/types'

const props = defineProps<{ task: Task }>()
const router = useRouter()

function openTask() {
  void router.push(`/tasks/${props.task.id}`)
}

const userInitials = (name: string) =>
  name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')

const dueDate = computed(() => {
  if (!props.task.complete_at) return null
  return new Date(props.task.complete_at)
})

const isCompleted = computed(() => !!props.task.completed_at)
const isOverdue = computed(() =>
  !isCompleted.value && dueDate.value !== null && dueDate.value < new Date(),
)

const formattedDue = computed(() => {
  if (!dueDate.value) return null
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(dueDate.value)
})

type TagSeverity = 'secondary' | 'info' | 'danger' | 'success'

const statusTag = computed<{ label: string; severity: TagSeverity }>(() => {
  if (isCompleted.value) return { label: 'Завершена', severity: 'success' }
  if (!props.task.complete_at) return { label: 'Без срока', severity: 'secondary' }
  if (isOverdue.value) return { label: 'Просрочена', severity: 'danger' }
  return { label: 'Активна', severity: 'info' }
})
</script>

<template>
  <article class="task-card" role="button" tabindex="0" @click="openTask" @keyup.enter="openTask">
    <div class="flex items-start justify-between gap-2">
      <h3 class="task-title">{{ task.title }}</h3>
      <Tag :value="statusTag.label" :severity="statusTag.severity" class="tag-compact shrink-0" />
    </div>

    <div class="flex items-center justify-between gap-2 mt-2.5">
      <div class="flex items-center gap-1.5 min-w-0">
        <Avatar
          :label="userInitials(task.responsible_user.name)"
          shape="circle"
          class="avatar-xs shrink-0 bg-blue-50 text-blue-700 font-semibold"
        />
        <span class="text-xs text-gray-500 truncate">{{ task.responsible_user.name }}</span>
      </div>

      <div class="flex items-center gap-1 shrink-0">
        <span class="pi pi-calendar text-gray-300" style="font-size: 10px;"></span>
        <span
          class="text-xs"
          :class="isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'"
        >
          {{ formattedDue ?? '—' }}
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.task-card {
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: box-shadow 150ms ease, border-color 150ms ease, background 150ms ease;
}

.task-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  border-color: #D1D5DB;
  background: #FAFAFA;
}

.task-title {
  font-size: 13.5px;
  font-weight: 500;
  color: #111827;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.avatar-xs {
  width: 20px !important;
  height: 20px !important;
  font-size: 9px !important;
}

.tag-compact {
  font-size: 10px !important;
  padding: 1px 6px !important;
  line-height: 1.6 !important;
}
</style>
