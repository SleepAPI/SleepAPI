import AccountMenu from '@/components/account/account-menu.vue'
import { VueWrapper, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('vue3-google-login', () => ({
  GoogleLogin: {
    template: '<div></div>'
  },
  googleLogout: vi.fn(),
  decodeCredential: vi.fn()
}))

type AccountMenuInstance = InstanceType<typeof AccountMenu>

describe('AccountMenu', () => {
  let wrapper: VueWrapper<AccountMenuInstance>

  beforeEach(async () => {
    wrapper = mount(AccountMenu)
  })

  it('renders guest information when not logged in', async () => {
    const activatorButton = wrapper.find('button')
    await activatorButton.trigger('click')
    expect(wrapper.vm.$data).toMatchInlineSnapshot(`
      {
        "loggedIn": false,
        "menu": true,
        "user": {
          "email": "",
          "id": "",
          "name": "Guest",
          "picture": "",
        },
      }
    `)
  })

  it('renders user information when logged in', async () => {
    wrapper.vm.updateUserData({
      picture: 'https://example.com/picture.jpg',
      given_name: 'John',
      email: 'john@example.xom',
      sub: '12345'
    })
    expect(wrapper.vm.$data).toMatchInlineSnapshot(`
      {
        "loggedIn": true,
        "menu": false,
        "user": {
          "email": "john@example.xom",
          "id": "12345",
          "name": "John",
          "picture": "https://example.com/picture.jpg",
        },
      }
    `)
  })

  it('resets user information when logged out', async () => {
    wrapper.vm.updateUserData({
      picture: 'https://example.com/picture.jpg',
      given_name: 'John',
      email: 'john@example.xom',
      sub: '12345'
    })
    expect(wrapper.vm.$data.loggedIn).toBe(true)

    wrapper.vm.logout()
    expect(wrapper.vm.$data).toMatchInlineSnapshot(`
      {
        "loggedIn": false,
        "menu": false,
        "user": {
          "email": "",
          "id": "",
          "name": "Guest",
          "picture": "",
        },
      }
    `)
  })
})
