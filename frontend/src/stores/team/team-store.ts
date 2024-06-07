import { TeamService } from '@/services/team/team-service'
import { useUserStore } from '@/stores/user-store'
import {
  MAX_TEAMS,
  MAX_TEAM_MEMBERS,
  type InstancedPokemonExt,
  type InstancedTeamExt
} from '@/types/member/instanced'
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
    getCurrentTeam: (state) => state.teams[state.currentIndex],
    getPokemon: (state) => {
      return (memberIndex: number) =>
        state.teams[state.currentIndex].members[memberIndex] ?? undefined
    },
    getTeamSize: (state) => state.teams[state.currentIndex].members.filter(Boolean).length
  },
  actions: {
    async populateTeams() {
      const userStore = useUserStore()
      if (userStore.loggedIn) {
        try {
          this.loadingTeams = true
          const teams = await TeamService.getTeams()

          // TODO: should diff versions of this.teams and teams, all teams/members
          // TODO: for teams/members that have diff in version we rerun simulations
          this.teams = teams

          // TODO: loadingTeams can be used to skeleton load the results while simulations rerunning
          this.loadingTeams = false
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
    async updateTeamMember(updatedMember: InstancedPokemonExt) {
      const userStore = useUserStore()
      if (userStore.loggedIn) {
        try {
          const instancedMember = await TeamService.createOrUpdateMember({
            teamIndex: this.currentIndex,
            member: updatedMember
          })
          this.teams[this.currentIndex].members[updatedMember.index] = instancedMember
        } catch (error) {
          console.error('Error updating teams')
        }
      } else {
        this.teams[this.currentIndex].members[updatedMember.index] = updatedMember
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
    },
    async duplicateMember(memberIndex: number) {
      const existingMember = this.getPokemon(memberIndex)
      const currentTeam = this.getCurrentTeam

      const openSlotIndex = currentTeam.members.findIndex((member) => member == null) // checks for both null and undefined
      if (openSlotIndex === -1 || existingMember == null) {
        console.error("No open slot or member can't be found")
        return
      }

      const duplicatedMember = { ...existingMember, index: openSlotIndex }
      currentTeam.members[openSlotIndex] = duplicatedMember

      await this.updateTeamMember(duplicatedMember)
    },
    async removeMember(memberIndex: number) {
      const userStore = useUserStore()
      if (userStore.loggedIn) {
        try {
          await TeamService.removeMember({
            teamIndex: this.currentIndex,
            memberIndex
          })
        } catch (error) {
          console.error('Error updating teams')
        }
      }

      this.teams[this.currentIndex].members[memberIndex] = undefined
    }
  },
  persist: true
})
