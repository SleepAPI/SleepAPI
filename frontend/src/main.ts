import { createPinia } from 'pinia'
import { createApp } from 'vue'
import vue3GoogleLogin from 'vue3-google-login'

// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'

import '@/assets/main.scss'

import App from '@/app.vue'
import router from '@/router/router'

import { type ThemeDefinition } from 'vuetify'

const darkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#191224',
    surface: '#403D58',
    primary: '#E63946',
    secondary: '#403D58',
    'on-background': '#ffffff',
    'on-surface': '#ffffff',
    'on-primary': '#ffffff',
    'on-secondary': '#ffffff'
  }
}

const app = createApp(App)
const vuetify = createVuetify({
  theme: {
    defaultTheme: 'darkTheme',
    themes: {
      darkTheme
    }
  }
})

app.use(createPinia())
app.use(vuetify)
app.use(router)
app.use(vue3GoogleLogin, {
  clientId: '983013278971-m60s443rk30e8sjk04aof0ltaanogck0.apps.googleusercontent.com'
})

app.mount('#app')
