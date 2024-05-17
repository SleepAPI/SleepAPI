import { GoogleService } from '@/services/login/google-service'
import axios from 'axios'
import type { LoginResponse, RefreshResponse } from 'sleepapi-common'
import { describe, expect, it, vi } from 'vitest'

vi.mock('axios')

const mockedAxios = axios as unknown as {
  post: ReturnType<typeof vi.fn>
}

describe('login', () => {
  it('should login user', async () => {
    const mockResponse: LoginResponse = {
      access_token: 'some-access-token',
      refresh_token: 'some-refresh-id',
      id_token: 'some-id-token',
      expiry_date: 1
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
