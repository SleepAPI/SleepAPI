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

import domainVersionPlugin from '@/stores/domain-version-plugin'
import { migrateStores } from '@/stores/store-service'
import { type ThemeDefinition } from 'vuetify'

// colors duplicated in colors.scss
const darkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#191224',
    surface: '#403D58',
    primary: '#E63946',
    secondary: '#5E5A7F',
    accent: '#9A95C3',

    strength: '#FFB81F',

    natureUp: 'FF683A',
    natureDown: '2BA0ED',

    subskillWhite: '#FAFAFA',
    subskillSilver: '#DCF2FF',
    subskillGold: '#FFE570',

    curry: '#ff9f4b',
    'curry-dark': '#e47615',
    salad: '#a8cf5c',
    'salad-dark': '#a8cf5c',
    dessert: '#f2df61',
    'dessert-dark': '#e1c405',

    ingredient: '#fbe346',
    berry: '#b297e7',
    skill: '#ff616e',

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
pinia.use(domainVersionPlugin)

app.use(pinia)
migrateStores()

app.use(vuetify)
app.use(router)
app.use(vue3GoogleLogin, {
  clientId: '493172605844-co84oe12lgh8v534q01l7t6n8lel75gm.apps.googleusercontent.com'
})

app.mount('#app')
