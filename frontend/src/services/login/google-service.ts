import axios from 'axios'
import type { LoginResponse, RefreshResponse } from 'sleepapi-common'

class GoogleServiceImpl {
  public async login(authorizationCode: string): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>('/api/login/signup', {
      authorizationCode
    })

    return response.data
  }

  public async refresh(deviceId: string): Promise<RefreshResponse> {
    const response = await axios.post<RefreshResponse>('/api/login/refresh', {
      deviceId
    })

    return response.data
  }
}
export const GoogleService = new GoogleServiceImpl()
