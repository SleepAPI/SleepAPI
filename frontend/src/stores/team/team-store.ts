import { TeamService } from '@/services/team/team-service'
import { randomName } from '@/services/utils/name-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useUserStore } from '@/stores/user-store'
import { MAX_TEAMS, MAX_TEAM_MEMBERS, type TeamInstance } from '@/types/member/instanced'
import { defineStore } from 'pinia'
import {
  DOMAIN_VERSION,
  berry,
  uuid,
  type PokemonInstanceExt,
  type RecipeType,
  type TeamSettingsRequest
} from 'sleepapi-common'

export interface TeamState {
  currentIndex: number
  maxAvailableTeams: number
  loadingTeams: boolean
  loadingMembers: boolean[]
  domainVersion: number
  teams: TeamInstance[]
}

export const useTeamStore = defineStore('team', {
  state: (): TeamState => ({
    currentIndex: 0,
    maxAvailableTeams: MAX_TEAMS,
    loadingTeams: false,
    loadingMembers: [false, false, false, false, false],
    domainVersion: 0,
    teams: [
      {
        index: 0,
        name: 'Log in to save your teams',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        favoredBerries: [],
        version: 0,
        members: new Array(MAX_TEAM_MEMBERS).fill(undefined),
        production: undefined
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
    getTeamSize: (state) => state.teams[state.currentIndex].members.filter(Boolean).length,
    getMemberLoading(state) {
      return (memberIndex: number) => {
        return state.loadingMembers[memberIndex]
      }
    }
  },
  actions: {
    async syncTeams() {
      const userStore = useUserStore()
      const pokemonStore = usePokemonStore()

      if (userStore.loggedIn) {
        // grab previous teams so we may compare it to updated teams from server
        const previousTeams = this.teams.map((team) => ({
          ...team,
          members: team.members.map((member) =>
            member ? pokemonStore.getPokemon(member) : undefined
          )
        }))

        // get updated teams from server
        // this also already updates the pokemon in pokemonStore
        const serverTeams = await TeamService.getTeams()

        // overwrite cached teams with data from server
        this.teams = serverTeams

        for (const serverTeam of serverTeams) {
          const previousTeam = previousTeams.find((team) => team.index === serverTeam.index)
          if (!previousTeam || previousTeam.version !== serverTeam.version) {
            // this team does not exist on this device previously or this team has been updated on other device
            // keep team's production undefined
            continue
          } else {
            // check if any individual members have been updated, if so set updated to true
            let memberUpdated = false
            for (let i = 0; i < serverTeam.members.length; i++) {
              const updatedMember = serverTeam.members[i]
              const populatedUpdateMember = updatedMember
                ? pokemonStore.getPokemon(updatedMember)
                : undefined

              const previousMember = previousTeam.members.find(
                (member, previousIndex) =>
                  previousIndex === i && member?.externalId === populatedUpdateMember?.externalId
              )

              // if the member is not the same uuid or the member is the same, but version mismatches we also re-sim
              if (previousMember && populatedUpdateMember?.version !== previousMember.version) {
                memberUpdated = true
                break
              }
            }

            // if neither team nor members have been update we copy production from cache
            if (!memberUpdated) {
              this.teams[serverTeam.index].production = previousTeam.production
            }
          }
        }
      }

      // we do this last since we want to fetch teams from server and update anyways first
      // if domain version is bumped this indicates the base pokemon data has changed (buffs, new patch etc)
      if (this.domainVersion < DOMAIN_VERSION) {
        for (const team of this.teams) {
          team.production = undefined
        }
        this.domainVersion = DOMAIN_VERSION
      }
    },
    next() {
      this.currentIndex = (this.currentIndex + 1) % this.teams.length
    },
    prev() {
      this.currentIndex = (this.currentIndex - 1 + this.teams.length) % this.teams.length
    },
    async updateTeam() {
      const userStore = useUserStore()
      if (userStore.loggedIn) {
        try {
          const { version } = await TeamService.createOrUpdateTeam(this.currentIndex, {
            name: this.getCurrentTeam.name,
            camp: this.getCurrentTeam.camp,
            bedtime: this.getCurrentTeam.bedtime,
            wakeup: this.getCurrentTeam.wakeup
          })

          this.getCurrentTeam.version = version
        } catch {
          console.error('Error updating teams')
        }
      }
    },
    async deleteTeam() {
      const userStore = useUserStore()

      const newName = userStore.loggedIn
        ? `Helper team ${this.currentIndex + 1}`
        : 'Log in to save your teams'

      this.teams[this.currentIndex] = {
        index: this.currentIndex,
        camp: false,
        name: newName,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        favoredBerries: [],
        version: 0,
        members: new Array(MAX_TEAM_MEMBERS).fill(undefined),
        production: undefined
      }

      if (userStore.loggedIn) {
        try {
          await TeamService.deleteTeam(this.currentIndex)
        } catch {
          console.error('Error updating teams')
        }
      }
    },
    async updateTeamMember(updatedMember: PokemonInstanceExt, memberIndex: number) {
      this.toggleMemberLoading(memberIndex)

      const userStore = useUserStore()
      const pokemonStore = usePokemonStore()

      pokemonStore.upsertLocalPokemon(updatedMember)

      if (userStore.loggedIn) {
        try {
          TeamService.createOrUpdateMember({
            teamIndex: this.currentIndex,
            memberIndex,
            member: updatedMember
          })
        } catch (error) {
          console.error('Error updating teams')
        }
      }

      this.teams[this.currentIndex].members[memberIndex] = updatedMember.externalId
      this.toggleMemberLoading(memberIndex)
      await this.calculateProduction(this.currentIndex)
    },
    async calculateProduction(teamIndex: number) {
      const pokemonStore = usePokemonStore()
      // TODO: this doesn't show, because we hide the entire results box
      this.loadingTeams = true

      const members: PokemonInstanceExt[] = []
      for (const member of this.teams[teamIndex].members) {
        if (member) {
          members.push(pokemonStore.getPokemon(member))
        }
      }
      const settings: TeamSettingsRequest = {
        camp: this.teams[teamIndex].camp,
        // TODO: hard-coded sleep times for now
        bedtime: this.teams[teamIndex].bedtime,
        wakeup: this.teams[teamIndex].wakeup
      }
      try {
        const production = await TeamService.calculateProduction({ members, settings })
        this.teams[teamIndex].production = production
      } catch {
        console.error('Could not calculate production, contact developer')
      }
      this.loadingTeams = false
    },
    async duplicateMember(memberIndex: number) {
      const existingMember = this.getPokemon(memberIndex)
      const currentTeam = this.getCurrentTeam

      const openSlotIndex = currentTeam.members.findIndex((member) => member == null) // checks for both null and undefined
      if (openSlotIndex === -1 || existingMember == null) {
        console.error("No open slot or member can't be found")
        return
      }
      this.toggleMemberLoading(openSlotIndex)

      const duplicatedMember: PokemonInstanceExt = {
        ...existingMember,
        version: 0,
        saved: false,
        externalId: uuid.v4(),
        name: randomName(12)
      }
      await this.updateTeamMember(duplicatedMember, openSlotIndex)
      this.toggleMemberLoading(openSlotIndex)
    },
    async removeMember(memberIndex: number) {
      this.toggleMemberLoading(memberIndex)

      const userStore = useUserStore()
      const pokemonStore = usePokemonStore()

      if (userStore.loggedIn) {
        try {
          TeamService.removeMember({
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
      this.toggleMemberLoading(memberIndex)
      await this.calculateProduction(this.currentIndex)
    },
    async toggleCamp() {
      this.getCurrentTeam.camp = !this.getCurrentTeam.camp
      this.updateTeam()
      await this.calculateProduction(this.currentIndex)
    },
    async updateSleep(params: { bedtime: string; wakeup: string }) {
      const { bedtime, wakeup } = params
      this.getCurrentTeam.bedtime = bedtime
      this.getCurrentTeam.wakeup = wakeup

      this.updateTeam()
      await this.calculateProduction(this.currentIndex)
    },
    // TODO: add test when db fixed
    async updateRecipeType(recipeType: RecipeType) {
      this.getCurrentTeam.recipeType = recipeType

      // this.updateTeam() // TODO: add recipe to db first
    },
    // TODO: add test when db fixed
    async updateFavoredBerries(berries: berry.Berry[]) {
      this.getCurrentTeam.favoredBerries = berries

      // this.updateTeam() // TODO: add recipe to db first
    },
    toggleMemberLoading(memberIndex: number) {
      this.loadingMembers[memberIndex] = !this.loadingMembers[memberIndex]
    }
  },
  persist: true
})
