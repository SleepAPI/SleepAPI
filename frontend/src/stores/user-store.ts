import { defineStore } from 'pinia'

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
    loggedIn: (state) => state.tokens !== null
  },
  actions: {
    setUserData(userData: { name: string; avatar?: string }) {
      this.name = userData.name
      this.avatar = userData.avatar ?? 'default'
    },
    clearUserData() {
      this.name = 'Guest'
      this.avatar = null
      this.tokens = null
    },
    setTokens(tokens: TokenInfo) {
      this.tokens = tokens
    }
  },
  persist: true
})
