import router from '@/router/router'
import { GoogleService } from '@/services/login/google-service'
import { clearCacheAndLogout } from '@/stores/store-service'
import { defineStore } from 'pinia'
import { MAX_ISLAND_BONUS, type LoginResponse } from 'sleepapi-common'
import { googleLogout } from 'vue3-google-login'

export interface UserState {
  name: string
  avatar: string | null
  email: string | null
  tokens: TokenInfo | null
  externalId: string | null
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
      email: null,
      tokens: null,
      externalId: null
    }
  },
  getters: {
    // loggedIn doesnt check if access token valid/expired, just that the user is logged in
    loggedIn: (state) => state.tokens !== null,
    islandBonus: (state) => 1 + MAX_ISLAND_BONUS / 100 // TODO: user should probably hold island bonuses and recipe levels
  },
  actions: {
    setUserData(userData: { name: string; avatar?: string; email: string; externalId: string }) {
      this.name = userData.name
      this.avatar = userData.avatar ?? 'default'
      this.email = userData.email
      this.externalId = userData.externalId
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
        avatar: loginResponse.avatar,
        email: loginResponse.email,
        externalId: loginResponse.externalId
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
          this.logout()
        }
      } catch {
        this.logout()
      }
    },
    logout() {
      clearCacheAndLogout()
      googleLogout()
      router.push('/')
    }
  },
  persist: true
})
