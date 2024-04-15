import router from '@/router/router'
import { config } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'

const vuetify = createVuetify({
  components,
  directives
})

config.global.plugins.push(vuetify, router)

config.global.stubs = {
  RouterView: true,
  RouterLink: true
}

global.ResizeObserver = require('resize-observer-polyfill')
