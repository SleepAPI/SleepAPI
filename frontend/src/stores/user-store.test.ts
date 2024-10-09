import router from '@/router/router'
import { GoogleService } from '@/services/login/google-service'
import { useUserStore } from '@/stores/user-store'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { googleLogout } from 'vue3-google-login'

vi.mock('vue3-google-login', () => ({
  googleLogout: vi.fn()
}))

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should have expected default state', () => {
    const userStore = useUserStore()
    expect(userStore.$state).toMatchInlineSnapshot(`
      {
        "avatar": null,
        "email": null,
        "externalId": null,
        "name": "Guest",
        "tokens": null,
      }
    `)

    expect(userStore.loggedIn).toBeFalsy()
  })

  it('setUserData should update the name and avatar', () => {
    const userStore = useUserStore()
    userStore.setUserData({
      name: 'some name',
      avatar: 'some avatar',
      email: 'some email',
      externalId: 'some id'
    })
    expect(userStore.$state).toMatchInlineSnapshot(`
      {
        "avatar": "some avatar",
        "email": "some email",
        "externalId": "some id",
        "name": "some name",
        "tokens": null,
      }
    `)
  })

  it('setTokens should update the token info', () => {
    const userStore = useUserStore()

    userStore.setTokens({
      accessToken: 'some access token',
      refreshToken: 'some refresh token',
      expiryDate: 10
    })

    expect(userStore.$state).toMatchInlineSnapshot(`
      {
        "avatar": null,
        "email": null,
        "externalId": null,
        "name": "Guest",
        "tokens": {
          "accessToken": "some access token",
          "expiryDate": 10,
          "refreshToken": "some refresh token",
        },
      }
    `)
  })

  it('reset should return name and avatar to defaults', () => {
    const userStore = useUserStore()
    userStore.setUserData({
      name: 'some name',
      avatar: 'some avatar',
      email: 'some email',
      externalId: 'some id'
    })
    userStore.setTokens({
      accessToken: 'some access token',
      refreshToken: 'some refresh token',
      expiryDate: 10
    })
    userStore.$reset()
    expect(userStore.$state).toMatchInlineSnapshot(`
      {
        "avatar": null,
        "email": null,
        "externalId": null,
        "name": "Guest",
        "tokens": null,
      }
    `)
  })

  it('should call Google on login and update user data', async () => {
    GoogleService.login = vi.fn().mockResolvedValue({
      access_token: 'some access token',
      refresh_token: 'some refresh token',
      expiry_date: '10',
      name: 'some name',
      avatar: 'some avatar'
    })

    router.go = vi.fn()

    const userStore = useUserStore()
    await userStore.login('some auth code')

    expect(GoogleService.login).toHaveBeenCalledWith('some auth code')
    expect(userStore.$state).toMatchInlineSnapshot(`
      {
        "avatar": "some avatar",
        "email": undefined,
        "externalId": undefined,
        "name": "some name",
        "tokens": {
          "accessToken": "some access token",
          "expiryDate": "10",
          "refreshToken": "some refresh token",
        },
      }
    `)
    expect(router.go).toHaveBeenCalledWith(0)
  })

  it('should refresh tokens if expired', async () => {
    GoogleService.refresh = vi.fn().mockResolvedValue({
      access_token: 'new access token',
      expiry_date: 10
    })

    const userStore = useUserStore()
    userStore.setTokens({
      accessToken: 'old access token',
      refreshToken: 'old refresh token',
      expiryDate: -10
    })

    await userStore.refresh()

    expect(GoogleService.refresh).toHaveBeenCalledWith('old refresh token')
    expect(userStore.tokens).toMatchObject({
      accessToken: 'new access token',
      refreshToken: 'old refresh token',
      expiryDate: 10
    })
  })

  it('should not refresh tokens if not expired', async () => {
    GoogleService.refresh = vi.fn()

    const userStore = useUserStore()
    userStore.setTokens({
      accessToken: 'access token',
      refreshToken: 'refresh token',
      expiryDate: Date.now() + 3600 * 1000 // 1 hour later
    })

    await userStore.refresh()

    expect(GoogleService.refresh).not.toHaveBeenCalled()
  })

  it('should clear user data if no tokens are available', async () => {
    const userStore = useUserStore()
    userStore.$reset = vi.fn()

    userStore.tokens = null

    await userStore.refresh()

    expect(userStore.$reset).toHaveBeenCalled()
  })

  it('should logout on refresh error', async () => {
    GoogleService.refresh = vi.fn().mockRejectedValue(new Error('Refresh error'))

    const userStore = useUserStore()
    userStore.setTokens({
      accessToken: 'access token',
      refreshToken: 'refresh token',
      expiryDate: -10
    })

    userStore.logout = vi.fn()

    await userStore.refresh()

    expect(userStore.logout).toHaveBeenCalled()
  })

  it('should clean up on logout', () => {
    router.push = vi.fn()

    const userStore = useUserStore()
    userStore.setUserData({
      name: 'some name',
      avatar: 'some avatar',
      email: 'some email',
      externalId: 'some id'
    })
    userStore.setTokens({
      accessToken: 'some access token',
      refreshToken: 'some refresh token',
      expiryDate: 10
    })

    userStore.logout()

    expect(userStore.$state).toMatchInlineSnapshot(`
      {
        "avatar": null,
        "email": null,
        "externalId": null,
        "name": "Guest",
        "tokens": null,
      }
    `)
    expect(googleLogout).toHaveBeenCalled()
    expect(router.push).toHaveBeenCalledWith('/')
  })
})
