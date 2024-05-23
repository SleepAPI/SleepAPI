import app from '@/app.vue'
import AccountMenu from '@/components/account/account-menu.vue'
import NavBar from '@/components/nav-bar/nav-bar.vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { VApp, VNavigationDrawer } from 'vuetify/components'

describe('app', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
  })

  it('shall contain navigation', () => {
    const wrapper = mount(app)
    expect(wrapper.findComponent(VApp).exists()).toBe(true)
    expect(wrapper.findComponent(VNavigationDrawer).exists()).toBe(true)
    expect(wrapper.findComponent(NavBar).exists()).toBe(true)
    expect(wrapper.findComponent(AccountMenu).exists()).toBe(true)
  })
})
