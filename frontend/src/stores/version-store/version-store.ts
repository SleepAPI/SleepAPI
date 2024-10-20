import { defineStore } from 'pinia'

export interface VersionState {
  version: string
}

export const useVersionStore = defineStore('version', {
  state: (): VersionState => {
    return {
      version: APP_VERSION || '1.0.0'
    }
  },
  getters: {
    updateFound: (state) => state.version !== APP_VERSION
  },
  actions: {
    updateVersion() {
      console.log(`Client updating version: ${this.version} -> ${APP_VERSION}`)
      this.version = APP_VERSION
    }
  },
  persist: true
})
