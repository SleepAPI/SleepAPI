import router from '@/router/router'
import { GoogleService } from '@/services/login/google-service'
import { useTeamStore } from '@/stores/team/team-store'
import { defineStore } from 'pinia'
import type { LoginResponse } from 'sleepapi-common'
import { googleLogout } from 'vue3-google-login'

export interface UserState {
  name: string
  avatar: string | null
  tokens: TokenInfo | null
}

export interface TokenInfo {
  expiryDate: number
  accessToken: string
  refreshToken: string
}

export const useUserStore = defineStore('user', {
  state: (): UserState => {
    return {
      name: 'Guest',
      avatar: null,
      tokens: null
    }
  },
  getters: {
    // loggedIn doesnt check if access token valid/expired, just that the user is logged in
    loggedIn: (state) => state.tokens !== null
  },
  actions: {
    setUserData(userData: { name: string; avatar?: string }) {
      this.name = userData.name
      this.avatar = userData.avatar ?? 'default'
    },
    reset() {
      this.name = 'Guest'
      this.avatar = null
      this.tokens = null
      const teamStore = useTeamStore()
      teamStore.reset()
    },
    setTokens(tokens: TokenInfo) {
      this.tokens = tokens
    },
    async login(authCode: string) {
      const loginResponse: LoginResponse = await GoogleService.login(authCode)
      this.setTokens({
        accessToken: loginResponse.access_token,
        refreshToken: loginResponse.refresh_token,
        expiryDate: loginResponse.expiry_date
      })
      this.setUserData({
        name: loginResponse.name,
        avatar: loginResponse.avatar
      })

      // Refresh the current page
      router.go(0)
    },
    async refresh() {
      try {
        const tokens = this.tokens
        if (tokens?.expiryDate) {
          if (Date.now() > tokens.expiryDate) {
            const { refreshToken } = tokens
            const { access_token, expiry_date } = await GoogleService.refresh(refreshToken)
            this.setTokens({
              accessToken: access_token,
              refreshToken,
              expiryDate: expiry_date
            })
          }
        } else {
          this.reset()
        }
      } catch {
        this.logout()
      }
    },
    logout() {
      this.reset()
      googleLogout()
      router.push('/')
    }
  },
  persist: true
})
