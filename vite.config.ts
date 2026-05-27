import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    Components({
      resolvers: [PrimeVueResolver()],
      dts: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: [
      'primevue/config',
      'primevue/autocomplete',
      'primevue/button',
      'primevue/inputtext',
      'primevue/inputgroup',
      'primevue/inputgroupaddon',
      'primevue/textarea',
      'primevue/datepicker',
      'primevue/select',
      'primevue/message',
      'primevue/toast',
      'primevue/toastservice',
      'primevue/confirmdialog',
      'primevue/confirmationservice',
      'primevue/dialog',
      'primevue/card',
      'primevue/divider',
      'primevue/skeleton',
      'primevue/tag',
      'primevue/avatar',
      'primevue/breadcrumb',
      'primevue/menu',
      'primevue/paginator',
      'primevue/progressspinner',
      'primevue/usetoast',
      'primevue/useconfirm',
      '@primevue/themes',
      '@primevue/themes/aura',
    ],
  },
})
