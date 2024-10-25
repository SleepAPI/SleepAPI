import serverAxios from '@/router/server-axios'
import { GoogleService } from '@/services/login/google-service'
import axios from 'axios'
import type { LoginResponse, RefreshResponse } from 'sleepapi-common'
import { describe, expect, it, vi } from 'vitest'

vi.mock('axios')

const mockedAxios = axios as unknown as {
  post: ReturnType<typeof vi.fn>
}
vi.mock('@/router/server-axios', () => ({
  default: {
    delete: vi.fn(() => undefined)
  }
}))

describe('login', () => {
  it('should login user', async () => {
    const mockResponse: LoginResponse = {
      name: 'some name',
      avatar: 'some-avatar',
      access_token: 'some-access-token',
      refresh_token: 'some-refresh-id',
      expiry_date: 1,
      email: 'some email',
      externalId: 'some id'
    }

    mockedAxios.post.mockResolvedValue({ data: mockResponse })

    const result = await GoogleService.login('some-auth-code')
    expect(result).toEqual(mockResponse)
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/login/signup', {
      authorization_code: 'some-auth-code'
    })
  })
})

describe('refresh', () => {
  it('should fetch and return refresh response', async () => {
    const refresh_token = 'test-refresh-token'
    const mockResponse: RefreshResponse = {
      access_token: 'test-access-token',
      expiry_date: 1234567890
    }

    mockedAxios.post.mockResolvedValue({ data: mockResponse })

    const result = await GoogleService.refresh(refresh_token)

    expect(result).toEqual(mockResponse)
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/login/refresh', { refresh_token })
  })

  it('should throw an error if the request fails', async () => {
    mockedAxios.post.mockRejectedValue(new Error('Request failed'))

    await expect(GoogleService.refresh('something')).rejects.toThrow('Request failed')
  })
})

describe('delete', () => {
  it('should call user delete on server', async () => {
    await GoogleService.delete()
    expect(serverAxios.delete).toHaveBeenCalledWith('/user')
  })
})
