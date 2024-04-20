import { createPinia } from 'pinia'
import { createApp } from 'vue'

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
app.use(router)
app.use(vuetify)

app.mount('#app')
