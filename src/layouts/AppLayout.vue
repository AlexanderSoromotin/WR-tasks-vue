<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const userMenuRef = ref()

const userInitials = computed(() => {
  const name = authStore.user?.name ?? ''
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
})

const userMenuItems = ref([
  {
    label: 'Выйти',
    icon: 'pi pi-sign-out',
    command: () => {
      authStore.logout()
      void router.push('/login')
    },
  },
])

function toggleUserMenu(event: Event) {
  userMenuRef.value.toggle(event)
}
</script>

<template>
  <div class="min-h-screen bg-[#F8F9FC]">
    <!-- Topbar -->
    <header class="topbar">
      <div class="topbar-inner">
        <!-- Logo -->
        <div class="flex items-center gap-2">
          <span class="pi pi-check-square text-blue-500 text-xl"></span>
          <span class="text-[15px] font-semibold text-gray-900 tracking-tight">White Rabbit Tasks</span>
        </div>

        <!-- User menu -->
        <div class="flex items-center gap-3">
          <span class="hidden sm:block text-sm text-gray-500">{{ authStore.user?.name }}</span>
          <Avatar
            :label="userInitials"
            shape="circle"
            class="cursor-pointer select-none bg-blue-100 text-blue-700 font-semibold"
            @click="toggleUserMenu"
          />
          <Menu ref="userMenuRef" :model="userMenuItems" popup />
        </div>
      </div>
    </header>

    <!-- Page content -->
    <main class="page-content">
      <Transition name="fade" mode="out-in">
        <RouterView />
      </Transition>
    </main>

    <Toast position="top-right" :life="4000" />
    <ConfirmDialog />
  </div>
</template>

<style scoped>
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #E5E7EB;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.topbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 32px;
  padding-top: calc(64px + 40px);
}

@media (max-width: 768px) {
  .topbar-inner {
    padding: 0 16px;
  }

  .page-content {
    padding: 24px 16px;
    padding-top: calc(64px + 24px);
  }
}
</style>


