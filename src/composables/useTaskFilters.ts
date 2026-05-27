import { computed, ref, watch, type Ref } from 'vue'
import {
  useRoute,
  useRouter,
  type LocationQuery,
  type LocationQueryRaw,
} from 'vue-router'
import type { TaskFilters } from '@/types'

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function parseQuery(query: LocationQuery): TaskFilters {
  const parsed: TaskFilters = {
    title: asString(query.title),
    responsible_user_id: asString(query.responsible_user_id),
    creator_user_id: asString(query.creator_user_id),
    created_from: asString(query.created_from),
    created_to: asString(query.created_to),
    complete_from: asString(query.complete_from),
    complete_to: asString(query.complete_to),
  }

  const page = Number(asString(query.page))
  if (!Number.isNaN(page) && page > 0) {
    parsed.page = page
  }

  const perPage = Number(asString(query.per_page))
  if (!Number.isNaN(perPage) && perPage > 0) {
    parsed.per_page = perPage
  }

  return parsed
}

function toQuery(filters: TaskFilters): LocationQueryRaw {
  const query: LocationQueryRaw = {}

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && String(value).length > 0) {
      query[key] = String(value)
    }
  }

  return query
}

export function useTaskFilters(): {
  filters: Ref<TaskFilters>
  setFilter: <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => Promise<void>
  resetFilters: () => Promise<void>
} {
  const route = useRoute()
  const router = useRouter()
  const filters = ref<TaskFilters>(parseQuery(route.query))

  const queryFromState = computed(() => toQuery(filters.value))

  watch(
    () => route.query,
    (query) => {
      filters.value = parseQuery(query)
    },
    { immediate: true },
  )

  async function setFilter<K extends keyof TaskFilters>(
    key: K,
    value: TaskFilters[K],
  ) {
    const nextFilters: TaskFilters = { ...filters.value, [key]: value }

    if (key !== 'page') {
      nextFilters.page = 1
    }

    filters.value = nextFilters
    await router.push({ query: toQuery(nextFilters) })
  }

  async function resetFilters() {
    filters.value = { page: 1, per_page: filters.value.per_page ?? 10 }
    await router.push({ query: queryFromState.value })
  }

  return { filters, setFilter, resetFilters }
}



