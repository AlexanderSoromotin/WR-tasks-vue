<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import UserSelect from '@/components/ui/UserSelect.vue'
import type { TaskFilters } from '@/types'

const props = defineProps<{ filters: TaskFilters }>()

const emit = defineEmits<{
  'update:filters': [filters: TaskFilters]
  reset: []
}>()

const local = reactive<TaskFilters>({ ...props.filters })

watch(
  () => props.filters,
  (val) => {
    Object.assign(local, val)
  },
  { deep: true, immediate: true },
)

const hasActiveFilters = computed(() =>
  !!(
    local.title ||
    local.responsible_user_id ||
    local.creator_user_id ||
    local.created_from ||
    local.created_to ||
    local.complete_from ||
    local.complete_to
  ),
)

let titleTimer: ReturnType<typeof setTimeout> | null = null

function onTitle(val: string) {
  local.title = val
  if (titleTimer) clearTimeout(titleTimer)
  titleTimer = setTimeout(() => emit('update:filters', { ...local }), 300)
}

function change<K extends keyof TaskFilters>(key: K, val: TaskFilters[K]) {
  ;(local as Record<string, unknown>)[key] = val
  emit('update:filters', { ...local })
}

function parseDateVal(val: string | undefined): Date | null {
  if (!val) return null
  const d = new Date(`${val}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

function formatDateVal(d: Date | null): string | undefined {
  if (!d) return undefined
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
</script>

<template>
  <div class="filters-bar">
    <!-- Row 1 -->
    <div class="filters-row">
      <!-- Title search -->
      <InputGroup class="filter-input-wide">
        <InputGroupAddon>
          <span class="pi pi-search text-gray-400 text-sm"></span>
        </InputGroupAddon>
        <InputText
          :model-value="local.title ?? ''"
          placeholder="Поиск по названию"
          size="small"
          @update:model-value="onTitle(String($event ?? ''))"
        />
      </InputGroup>

      <!-- Responsible user -->
      <UserSelect
        :model-value="local.responsible_user_id"
        placeholder="Ответственный"
        size="small"
        class="filter-input"
        @update:model-value="change('responsible_user_id', $event)"
      />

      <!-- Creator user -->
      <UserSelect
        :model-value="local.creator_user_id"
        placeholder="Постановщик"
        size="small"
        class="filter-input"
        @update:model-value="change('creator_user_id', $event)"
      />
    </div>

    <!-- Row 2 -->
    <div class="filters-row">
      <DatePicker
        :model-value="parseDateVal(local.created_from)"
        date-format="dd.mm.yy"
        placeholder="Создано от"
        size="small"
        show-icon
        class="filter-input"
        @update:model-value="change('created_from', formatDateVal(($event as Date | null) ?? null))"
      />
      <DatePicker
        :model-value="parseDateVal(local.created_to)"
        date-format="dd.mm.yy"
        placeholder="Создано до"
        size="small"
        show-icon
        class="filter-input"
        @update:model-value="change('created_to', formatDateVal(($event as Date | null) ?? null))"
      />
      <DatePicker
        :model-value="parseDateVal(local.complete_from)"
        date-format="dd.mm.yy"
        placeholder="Срок от"
        size="small"
        show-icon
        class="filter-input"
        @update:model-value="change('complete_from', formatDateVal(($event as Date | null) ?? null))"
      />
      <DatePicker
        :model-value="parseDateVal(local.complete_to)"
        date-format="dd.mm.yy"
        placeholder="Срок до"
        size="small"
        show-icon
        class="filter-input"
        @update:model-value="change('complete_to', formatDateVal(($event as Date | null) ?? null))"
      />

      <Button
        v-if="hasActiveFilters"
        label="Сбросить"
        size="small"
        severity="secondary"
        text
        icon="pi pi-times"
        @click="emit('reset')"
      />
    </div>
  </div>
</template>

<style scoped>
.filters-bar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.filter-input {
  width: 180px;
}

.filter-input-wide {
  width: 240px;
}

@media (max-width: 768px) {
  .filter-input,
  .filter-input-wide {
    width: 100%;
  }
}
</style>

