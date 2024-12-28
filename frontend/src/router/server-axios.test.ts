import serverAxios from '@/router/server-axios'
import { useUserStore } from '@/stores/user-store'
import MockAdapter from 'axios-mock-adapter'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

describe('serverAxios', () => {
  let mock = new MockAdapter(serverAxios)

  beforeEach(() => {
    setActivePinia(createPinia())
    mock = new MockAdapter(serverAxios)
  })

  afterEach(() => {
    mock.reset()
  })

  test('should add Authorization header if tokens are available', async () => {
    const userStore = useUserStore()
    userStore.setTokens({
      accessToken: 'testAccessToken',
      refreshToken: 'testRefreshToken',
      expiryDate: Date.now() + 3600 * 1000
    })
    userStore.refresh = vi.fn().mockResolvedValue(true)

    mock.onGet('/test').reply(200)

    await serverAxios.get('/test')

    expect(userStore.refresh).toHaveBeenCalled()
    expect(mock.history.get[0]!.headers!.Authorization).toBe('Bearer testAccessToken')
  })

  test('should call logout on 401 response', async () => {
    const loggerErrorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {})

    mock.onGet('/test').reply(401)
    const userStore = useUserStore()
    userStore.logout = vi.fn()

    await expect(serverAxios.get('/test')).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Request failed with status code 401]`
    )

    expect(userStore.logout).toHaveBeenCalled()
    expect(loggerErrorSpy).toHaveBeenCalledWith('Unauthorized')
  })

  test('should log error on timeout', async () => {
    const loggerErrorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {})

    mock.onGet('/test').timeout()

    await expect(serverAxios.get('/test')).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: timeout of 20000ms exceeded]`
    )
    expect(loggerErrorSpy).toHaveBeenCalledWith('Connection to server timed out')
  })

  test('should log generic error on other errors', async () => {
    logger.error = vi.fn()

    mock.onGet('/test').networkError()

    await expect(serverAxios.get('/test')).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Network Error]`)
    expect(logger.error).toHaveBeenCalledWith('Something went wrong')
  })
})
