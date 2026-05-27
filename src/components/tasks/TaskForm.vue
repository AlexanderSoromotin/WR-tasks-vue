<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import UserSelect from '@/components/ui/UserSelect.vue'
import type { CreateTaskPayload, UpdateTaskPayload, User } from '@/types'

const props = defineProps<{
  initialValues?: Partial<UpdateTaskPayload>
  /** Объект пользователя-ответственного для отображения имени при редактировании */
  initialResponsibleUser?: User | null
  isLoading: boolean
  errors: Record<string, string[]>
  submitLabel?: string
}>()

const emit = defineEmits<{
  submit: [payload: CreateTaskPayload | UpdateTaskPayload]
  cancel: []
}>()

const form = reactive({
  title: '',
  description: '',
  responsible_user_id: '',
  complete_at: null as Date | null,
})

// Текущий объект пользователя для UserSelect (нужен для отображения имени)
const responsibleUser = ref<User | null>(props.initialResponsibleUser ?? null)

watch(
  () => props.initialValues,
  (val) => {
    form.title = val?.title ?? ''
    form.description = (val?.description as string | undefined) ?? ''
    form.responsible_user_id = val?.responsible_user_id ?? ''
    if (val?.complete_at) {
      const d = new Date(val.complete_at + 'T00:00:00')
      form.complete_at = Number.isNaN(d.getTime()) ? null : d
    } else {
      form.complete_at = null
    }
  },
  { immediate: true },
)

watch(
  () => props.initialResponsibleUser,
  (user) => { responsibleUser.value = user ?? null },
)

function formatDate(date: Date | null): string | null {
  if (!date) return null
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function submit() {
  emit('submit', {
    title: form.title,
    description: form.description || null,
    responsible_user_id: form.responsible_user_id,
    complete_at: formatDate(form.complete_at),
  })
}
</script>

<template>
  <form class="flex flex-col gap-5" @submit.prevent="submit">
    <div class="form-field">
      <label class="form-label" for="tf-title">Название <span class="text-red-500">*</span></label>
      <InputText
        id="tf-title"
        v-model="form.title"
        required
        fluid
        :invalid="!!errors.title?.[0]"
      />
      <small v-if="errors.title?.[0]" class="form-error">{{ errors.title[0] }}</small>
    </div>

    <div class="form-field">
      <label class="form-label" for="tf-desc">Описание</label>
      <Textarea
        id="tf-desc"
        v-model="form.description"
        rows="4"
        auto-resize
        fluid
        :invalid="!!errors.description?.[0]"
      />
      <small v-if="errors.description?.[0]" class="form-error">{{ errors.description[0] }}</small>
    </div>

    <div class="form-field">
      <label class="form-label" for="tf-resp">
        Ответственный <span class="text-red-500">*</span>
      </label>
      <UserSelect
        v-model="form.responsible_user_id"
        :initial-user="responsibleUser"
        placeholder="Поиск по имени или email..."
        fluid
        :invalid="!!errors.responsible_user_id?.[0]"
      />
      <small v-if="errors.responsible_user_id?.[0]" class="form-error">
        {{ errors.responsible_user_id[0] }}
      </small>
    </div>

    <div class="form-field">
      <label class="form-label" for="tf-date">Срок выполнения</label>
      <DatePicker
        id="tf-date"
        v-model="form.complete_at"
        date-format="dd.mm.yy"
        placeholder="дд.мм.гггг"
        show-icon
        fluid
        :invalid="!!errors.complete_at?.[0]"
      />
      <small v-if="errors.complete_at?.[0]" class="form-error">{{ errors.complete_at[0] }}</small>
    </div>

    <div class="flex justify-end gap-2 pt-2">
      <Button
        type="button"
        label="Отмена"
        severity="secondary"
        text
        :disabled="isLoading"
        @click="emit('cancel')"
      />
      <Button
        type="submit"
        :label="submitLabel ?? 'Сохранить'"
        :loading="isLoading"
        :disabled="isLoading"
      />
    </div>
  </form>
</template>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  letter-spacing: 0.01em;
}

.form-error {
  font-size: 12px;
  color: #ef4444;
}
</style>

