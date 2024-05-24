import { defineStore } from 'pinia'

export interface NotificationState {
  showTeamNameNotification: boolean
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => {
    return {
      showTeamNameNotification: true
    }
  },
  actions: {
    hideTeamNameNotification() {
      this.showTeamNameNotification = false
    }
  },
  persist: true
})
