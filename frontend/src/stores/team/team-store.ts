import { TeamService } from '@/services/team/team-service'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useUserStore } from '@/stores/user-store'
import {
  MAX_TEAMS,
  MAX_TEAM_MEMBERS,
  type PokemonInstanceExt,
  type TeamInstance
} from '@/types/member/instanced'
import { defineStore } from 'pinia'

export interface TeamState {
  currentIndex: number
  maxAvailableTeams: number
  loadingTeams: boolean
  teams: TeamInstance[]
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
      return (memberIndex: number) => {
        const pokemonStore = usePokemonStore()
        const pokemonExternalId = state.teams[state.currentIndex].members[memberIndex]
        return pokemonExternalId != null ? pokemonStore.getPokemon(pokemonExternalId) : undefined
      }
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

          // overwrite cached teams with data from server
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
    async updateTeamMember(updatedMember: PokemonInstanceExt, memberIndex: number) {
      const userStore = useUserStore()
      const pokemonStore = usePokemonStore()

      pokemonStore.upsertPokemon(updatedMember)

      if (userStore.loggedIn) {
        try {
          await TeamService.createOrUpdateMember({
            teamIndex: this.currentIndex,
            memberIndex,
            member: updatedMember
          })
        } catch (error) {
          console.error('Error updating teams')
        }
      }

      this.teams[this.currentIndex].members[memberIndex] = updatedMember.externalId
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

      await this.updateTeamMember(existingMember, openSlotIndex)
    },
    async removeMember(memberIndex: number) {
      const userStore = useUserStore()
      const pokemonStore = usePokemonStore()

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

      const member = this.getPokemon(memberIndex)

      // check if this is only time this mon is used
      const nrOfOccurences = this.teams.flatMap((team) =>
        team.members.filter((m) => m != null && member != null && m === member.externalId)
      ).length
      if (member != null && !member.saved && nrOfOccurences === 1) {
        pokemonStore.removePokemon(member.externalId)
      }

      this.teams[this.currentIndex].members[memberIndex] = undefined
    }
  },
  persist: true
})
