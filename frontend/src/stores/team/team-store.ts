import { TeamService } from '@/services/team/team-service'
import { useUserStore } from '@/stores/user-store'
import { defineStore } from 'pinia'

export interface TeamState {
  currentIndex: number
  maxAvailableTeams: number
  loadingTeams: boolean
  teams: TeamInterface[]
}

export interface TeamInterface {
  index: number
  name: string
  camp: boolean
}

export const useTeamStore = defineStore('team', {
  state: (): TeamState => ({
    currentIndex: 0,
    maxAvailableTeams: 5,
    loadingTeams: true,
    teams: [
      {
        index: 0,
        name: 'Log in to save your teams',
        camp: false
      }
    ]
  }),
  getters: {
    getCurrentTeam: (state) => state.teams[state.currentIndex]
  },
  actions: {
    async populateTeams() {
      const userStore = useUserStore()
      if (userStore.loggedIn && this.teams.length < this.maxAvailableTeams) {
        try {
          this.loadingTeams = true
          const teams = await TeamService.getTeams()
          this.loadingTeams = false

          this.teams = Array.from({ length: this.maxAvailableTeams }, (_, i) => {
            const teamFromResponse = teams.find((team) => team.index === i)
            return teamFromResponse
              ? teamFromResponse
              : { index: i, name: `Helper team ${i + 1}`, camp: false }
          })
        } catch (error) {
          console.error('Error fetching teams')
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
      this.maxAvailableTeams = 5
      this.loadingTeams = true
      this.teams = [
        {
          index: 0,
          name: 'Log in to save your teams',
          camp: false
        }
      ]
    }
  },
  persist: true
})
