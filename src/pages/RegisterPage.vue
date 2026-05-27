<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import { extractApiErrors } from '@/utils/errors'
import type { RegisterPayload } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const form = reactive<RegisterPayload>({ name: '', email: '', password: '' })
const loading = ref(false)
const fieldErrors = ref<Record<string, string[]>>({})
const showPassword = ref(false)

async function submit() {
  loading.value = true
  fieldErrors.value = {}

  try {
    await authStore.register(form)
    await router.push('/')
  } catch (err) {
    const apiError = extractApiErrors(err)
    fieldErrors.value = apiError.errors ?? {}
    toast.add({ severity: 'error', summary: 'Ошибка', detail: apiError.message, life: 4000 })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-bg">
    <div class="auth-card">
      <!-- Logo -->
      <div class="flex flex-col items-center gap-1 mb-6">
        <span class="pi pi-check-square text-blue-500 text-3xl"></span>
        <span class="text-[22px] font-bold text-gray-900 tracking-tight">White Rabbit Tasks</span>
      </div>

      <div class="mb-6">
        <h1 class="text-[22px] font-semibold text-gray-900 mb-1">Регистрация</h1>
        <p class="text-sm text-gray-500">Создайте аккаунт, чтобы начать работу</p>
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="submit">
        <div class="field">
          <label class="field-label" for="name">Имя</label>
          <InputText
            id="name"
            v-model="form.name"
            placeholder="Иван Иванов"
            required
            fluid
            :invalid="!!fieldErrors.name?.[0]"
          />
          <small v-if="fieldErrors.name?.[0]" class="field-error">{{ fieldErrors.name[0] }}</small>
        </div>

        <div class="field">
          <label class="field-label" for="email">Email</label>
          <InputText
            id="email"
            v-model="form.email"
            type="email"
            placeholder="you@example.com"
            required
            fluid
            :invalid="!!fieldErrors.email?.[0]"
          />
          <small v-if="fieldErrors.email?.[0]" class="field-error">{{ fieldErrors.email[0] }}</small>
        </div>

        <div class="field">
          <label class="field-label" for="password">Пароль</label>
          <InputGroup>
            <InputText
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              required
              :invalid="!!fieldErrors.password?.[0]"
            />
            <InputGroupAddon>
              <button
                type="button"
                class="toggle-btn"
                :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
                @click="showPassword = !showPassword"
              >
                <span :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-gray-400"></span>
              </button>
            </InputGroupAddon>
          </InputGroup>
          <small v-if="fieldErrors.password?.[0]" class="field-error">{{ fieldErrors.password[0] }}</small>
        </div>

        <Button
          type="submit"
          label="Создать аккаунт"
          size="large"
          :loading="loading"
          :disabled="loading"
          class="w-full mt-2"
          style="height: 44px"
        />
      </form>

      <p class="text-center text-sm text-gray-500 mt-6">
        Уже есть аккаунт?
        <RouterLink to="/login" class="text-blue-600 font-medium hover:text-blue-700">Войти</RouterLink>
      </p>
    </div>

    <Toast />
  </div>
</template>

<style scoped>
.auth-bg {
  min-height: 100vh;
  background: #F8F9FC;
  display: grid;
  place-items: center;
  padding: 24px 16px;
}

.auth-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 40px;
  width: min(420px, 100%);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  letter-spacing: 0.01em;
}

.field-error {
  font-size: 12px;
  color: #EF4444;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 4px;
  display: flex;
  align-items: center;
}
</style>
