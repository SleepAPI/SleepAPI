import { TeamService } from '@/services/team/team-service'
import { useUserStore } from '@/stores/user-store'
import { MAX_TEAMS, MAX_TEAM_MEMBERS, type InstancedTeamExt } from '@/types/instanced'
import { defineStore } from 'pinia'

export interface TeamState {
  currentIndex: number
  maxAvailableTeams: number
  loadingTeams: boolean
  teams: InstancedTeamExt[]
}

export const useTeamStore = defineStore('team', {
  state: (): TeamState => ({
    currentIndex: 0,
    maxAvailableTeams: MAX_TEAMS,
    loadingTeams: true,
    teams: [
      {
        index: 0,
        name: 'Log in to save your teams',
        camp: false,
        version: 0,
        members: new Array(MAX_TEAM_MEMBERS).fill(undefined)
      }
    ]
  }),
  getters: {
    getCurrentTeam: (state) => state.teams[state.currentIndex]
  },
  actions: {
    // empty cache, first time user loads teams on this device
    async populateTeams() {
      const userStore = useUserStore()
      if (userStore.loggedIn && this.teams.length < this.maxAvailableTeams) {
        try {
          this.loadingTeams = true
          const teams = await TeamService.getTeams()
          this.loadingTeams = false

          this.teams = teams
        } catch (error) {
          console.error('Error fetching teams: ')
          const userStore = useUserStore()
          userStore.logout()
        }
      }
      this.loadingTeams = false
    },
    next() {
      this.currentIndex = (this.currentIndex + 1) % this.teams.length
    },
    prev() {
      this.currentIndex = (this.currentIndex - 1 + this.teams.length) % this.teams.length
    },
    async updateTeamName(updatedName: string) {
      this.teams[this.currentIndex].name = updatedName

      const userStore = useUserStore()
      if (userStore.loggedIn) {
        try {
          await TeamService.createOrUpdateTeam(this.currentIndex, {
            name: this.getCurrentTeam.name,
            camp: this.getCurrentTeam.camp
          })
        } catch {
          console.error('Error updating teams')
        }
      }
    },
    reset() {
      this.currentIndex = 0
      this.maxAvailableTeams = MAX_TEAMS
      this.loadingTeams = true
      this.teams = [
        {
          index: 0,
          name: 'Log in to save your teams',
          camp: false,
          version: 0,
          members: new Array(MAX_TEAM_MEMBERS).fill(undefined)
        }
      ]
    }
  },
  persist: true
})
