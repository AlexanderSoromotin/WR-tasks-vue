<script setup lang="ts">
import Paginator from 'primevue/paginator'

const props = defineProps<{
  currentPage: number
  lastPage: number
}>()

const emit = defineEmits<{
  pageChange: [page: number]
}>()

function onPageChange(event: { page: number }) {
  const nextPage = event.page + 1
  if (nextPage !== props.currentPage) {
    emit('pageChange', nextPage)
  }
}
</script>

<template>
  <Paginator
    v-if="lastPage > 1"
    :rows="1"
    :total-records="lastPage"
    :first="currentPage - 1"
    template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
    @page="onPageChange"
  />
</template>


