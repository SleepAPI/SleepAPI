import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { createApp } from 'vue'
import vue3GoogleLogin from 'vue3-google-login'

// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { VTimePicker } from 'vuetify/labs/VTimePicker'
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
    secondary: '#5E5A7F',
    accent: '#FFB81F',
    natureUp: 'FF683A',
    natureDown: '2BA0ED',
    subskillWhite: '#FAFAFA',
    subskillSilver: '#DCF2FF',
    subskillGold: '#FFE570',
    curry: '#f38004',
    salad: '#79ab36',
    dessert: '#f44a6c',
    ingredient: '#fec34f',
    berry: '#23da6c',
    skill: '#49a2ff',
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
  },
  components: {
    VTimePicker
  }
})

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

app.use(vuetify)
app.use(router)
app.use(vue3GoogleLogin, {
  clientId: '983013278971-m60s443rk30e8sjk04aof0ltaanogck0.apps.googleusercontent.com'
})

app.mount('#app')
