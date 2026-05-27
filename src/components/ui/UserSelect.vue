<script setup lang="ts">
import { ref, watch } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete'
import { usersApi } from '@/api/users'
import type { User } from '@/types'

/**
 * Двунаправленная привязка: снаружи хранится и передаётся строка user_id.
 * Внутри компонент работает с объектом User для отображения имени.
 */
const props = defineProps<{
  modelValue: string | undefined
  placeholder?: string
  size?: 'small' | 'large'
  invalid?: boolean
  fluid?: boolean
  /** Если передан начальный пользователь — сразу показываем его имя */
  initialUser?: User | null
}>()

const emit = defineEmits<{
  'update:modelValue': [id: string | undefined]
}>()

// Внутреннее представление — объект User или null
const selected = ref<User | null>(null)
const suggestions = ref<User[]>([])
let searchTimer: ReturnType<typeof setTimeout> | null = null

// Если снаружи сбрасывают значение на undefined/'' — очищаем
watch(
  () => props.modelValue,
  (val) => {
    if (!val && selected.value) {
      selected.value = null
    }
  },
)

// Если передали initialUser — подставляем сразу
watch(
  () => props.initialUser,
  (user) => {
    if (user && selected.value?.id !== user.id) {
      selected.value = user
    }
  },
  { immediate: true },
)

async function fetchUsers(query: string) {
  try {
    const { data } = await usersApi.search({ search: query, per_page: 10 })
    suggestions.value = data.data
  } catch {
    suggestions.value = []
  }
}

async function search(event: AutoCompleteCompleteEvent) {
  if (searchTimer) clearTimeout(searchTimer)
  if (event.query.length === 0) {
    await fetchUsers('')
  } else {
    searchTimer = setTimeout(() => fetchUsers(event.query), 250)
  }
}

function onSelect(event: { value: User }) {
  selected.value = event.value
  emit('update:modelValue', event.value.id)
}

function onClear() {
  selected.value = null
  emit('update:modelValue', undefined)
}
</script>

<template>
  <AutoComplete
    v-model="selected"
    :suggestions="suggestions"
    option-label="name"
    :placeholder="placeholder ?? 'Поиск пользователя...'"
    :size="size"
    :invalid="invalid"
    :fluid="fluid"
    force-selection
    complete-on-focus
    @complete="search"
    @item-select="onSelect"
    @clear="onClear"
  >
    <template #option="{ option }">
      <div class="flex flex-col gap-0.5 py-0.5">
        <span class="text-sm font-medium text-gray-900">{{ option.name }}</span>
        <span class="text-xs text-gray-400">{{ option.email }}</span>
      </div>
    </template>

    <template #empty>
      <div class="px-3 py-2 text-sm text-gray-400">Пользователи не найдены</div>
    </template>
  </AutoComplete>
</template>

