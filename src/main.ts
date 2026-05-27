import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css'
import './style.css'
import App from './App.vue'
import router from '@/router'
import { AppTheme } from './primevue.config'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: AppTheme,
    options: {
      darkModeSelector: false,
    },
  },
})
app.use(ConfirmationService)
app.use(ToastService)

app.mount('#app')
