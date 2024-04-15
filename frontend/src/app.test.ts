import app from '@/app.vue'
import AccountMenu from '@/components/account/account-menu.vue'
import NavBar from '@/components/nav-bar/nav-bar.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { VApp, VNavigationDrawer } from 'vuetify/components'

describe('app', () => {
  const wrapper = mount(app)

  it('shall contain navigation', () => {
    expect(wrapper.findComponent(VApp).exists()).toBe(true)
    expect(wrapper.findComponent(VNavigationDrawer).exists()).toBe(true)
    expect(wrapper.findComponent(NavBar).exists()).toBe(true)
    expect(wrapper.findComponent(AccountMenu).exists()).toBe(true)
  })
})
