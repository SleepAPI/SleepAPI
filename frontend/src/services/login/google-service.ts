import axios from 'axios'
import type { LoginResponse, RefreshResponse } from 'sleepapi-common'

class GoogleServiceImpl {
  public async login(authorization_code: string): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>('/api/login/signup', {
      authorization_code
    })

    return response.data
  }

  public async refresh(refresh_token: string): Promise<RefreshResponse> {
    const response = await axios.post<RefreshResponse>('/api/login/refresh', {
      refresh_token
    })

    return response.data
  }
}
export const GoogleService = new GoogleServiceImpl()
