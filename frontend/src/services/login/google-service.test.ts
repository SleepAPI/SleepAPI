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
      accessToken: 'some-access-token',
      deviceId: 'some-device-id',
      idToken: 'some-id-token',
      expiryDate: 1
    }

    mockedAxios.post.mockResolvedValue({ data: mockResponse })

    const result = await GoogleService.login('some-auth-code')
    expect(result).toEqual(mockResponse)
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/login/signup', {
      authorizationCode: 'some-auth-code'
    })
  })
})

describe('refresh', () => {
  it('should fetch and return refresh response', async () => {
    const deviceId = 'test-device-id'
    const mockResponse: RefreshResponse = {
      accessToken: 'test-access-token',
      expiryDate: 1234567890
    }

    mockedAxios.post.mockResolvedValue({ data: mockResponse })

    const result = await GoogleService.refresh(deviceId)

    expect(result).toEqual(mockResponse)
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/login/refresh', { deviceId })
  })

  it('should throw an error if the request fails', async () => {
    const deviceId = 'test-device-id'

    mockedAxios.post.mockRejectedValue(new Error('Request failed'))

    await expect(GoogleService.refresh(deviceId)).rejects.toThrow('Request failed')
  })
})
