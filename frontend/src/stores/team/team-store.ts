import { TeamService } from '@/services/team/team-service'
import { randomName } from '@/services/utils/name-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useUserStore } from '@/stores/user-store'
import { MAX_TEAMS, MAX_TEAM_MEMBERS, type TeamInstance } from '@/types/member/instanced'
import type { TimeWindowDay } from '@/types/time/time-window'
import { defineStore } from 'pinia'
import {
  DOMAIN_VERSION,
  berry,
  mainskill,
  subskill,
  uuid,
  type PokemonInstanceExt,
  type RecipeType,
  type TeamSettings
} from 'sleepapi-common'

export interface TeamState {
  currentIndex: number
  maxAvailableTeams: number
  loadingTeams: boolean
  loadingMembers: boolean[]
  domainVersion: number
  timeWindow: TimeWindowDay
  tab: 'overview' | 'members' | 'cooking'
  teams: TeamInstance[]
}

export const useTeamStore = defineStore('team', {
  state: (): TeamState => ({
    currentIndex: 0,
    maxAvailableTeams: MAX_TEAMS,
    loadingTeams: false,
    loadingMembers: [false, false, false, false, false],
    domainVersion: 0,
    timeWindow: '24H',
    tab: 'overview',
    teams: [
      {
        index: 0,
        memberIndex: 0,
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
    },
    getCurrentMember: (state) => {
      const currentTeam = state.teams[state.currentIndex]
      return currentTeam.production?.members.at(currentTeam.memberIndex)?.memberExternalId
    }
  },
  actions: {
    migrate() {
      if (!this.timeWindow) {
        this.timeWindow = '24H'
      }
      if (!this.tab) {
        this.tab = 'overview'
      }
      if (this.maxAvailableTeams < MAX_TEAMS) {
        this.maxAvailableTeams = MAX_TEAMS
      }

      for (const team of this.teams) {
        if (!team.memberIndex) {
          team.memberIndex = 0
        }
      }
    },
    outdate() {
      for (const team of this.teams) {
        team.production = undefined
      }
      this.domainVersion = DOMAIN_VERSION
    },
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
          const {
            favoredBerries: teamBerries,
            name,
            camp,
            bedtime,
            wakeup,
            recipeType
          } = this.getCurrentTeam

          const anyFavoredBerries = teamBerries?.length > 0
          const favoredBerries = anyFavoredBerries
            ? teamBerries.length === berry.BERRIES.length
              ? ['all']
              : teamBerries.map((b) => b.name)
            : undefined

          const { version } = await TeamService.createOrUpdateTeam(this.currentIndex, {
            name,
            camp,
            bedtime,
            wakeup,
            recipeType,
            favoredBerries
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
        memberIndex: 0,
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
      this.loadingMembers[memberIndex] = true

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

      await this.calculateProduction(this.currentIndex)
      // reset single production to trigger radar chart recalc
      if (this.isSupportMember(updatedMember)) {
        this.resetCurrentTeamSingleProduction()
      } else if (
        this.teams[this.currentIndex]?.production &&
        this.teams[this.currentIndex].production?.members[memberIndex]
      ) {
        this.teams[this.currentIndex].production!.members[memberIndex].singleProduction = undefined
      }

      this.loadingMembers[memberIndex] = false
    },
    async calculateProduction(teamIndex: number) {
      const pokemonStore = usePokemonStore()
      this.loadingTeams = true

      const members: PokemonInstanceExt[] = []
      for (const member of this.teams[teamIndex].members) {
        if (member) {
          const pokemon = pokemonStore.getPokemon(member)
          pokemon && members.push(pokemon)
        }
      }
      const settings: TeamSettings = {
        camp: this.teams[teamIndex].camp,
        bedtime: this.teams[teamIndex].bedtime,
        wakeup: this.teams[teamIndex].wakeup
      }
      try {
        const newProduction = await TeamService.calculateProduction({ members, settings })

        const existingProduction = this.teams[teamIndex].production

        if (!existingProduction || !newProduction) {
          this.teams[teamIndex].production = newProduction
        } else {
          // preserve the cached single production results
          const mergedMembers = newProduction.members.map((newMemberProduction, index) => {
            const existingMemberProduction = existingProduction.members[index]

            if (existingMemberProduction && existingMemberProduction.singleProduction) {
              return {
                ...newMemberProduction,
                singleProduction: existingMemberProduction.singleProduction
              }
            }

            return newMemberProduction
          })

          this.teams[teamIndex].production = {
            ...newProduction,
            members: mergedMembers
          }
        }
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
      this.loadingMembers[openSlotIndex] = true

      const duplicatedMember: PokemonInstanceExt = {
        ...existingMember,
        version: 0,
        saved: false,
        externalId: uuid.v4(),
        name: randomName(12, existingMember.gender)
      }
      await this.updateTeamMember(duplicatedMember, openSlotIndex)
      this.loadingMembers[openSlotIndex] = false
    },
    async removeMember(memberIndex: number) {
      this.loadingMembers[memberIndex] = true

      const userStore = useUserStore()
      const pokemonStore = usePokemonStore()

      // members array will be reduced by one
      this.getCurrentTeam.memberIndex = Math.max(this.getCurrentTeam.memberIndex - 1, 0)

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
      if (member != null) {
        if (this.isSupportMember(member)) {
          this.resetCurrentTeamSingleProduction()
        }
        pokemonStore.removePokemon(member.externalId, 'team')
      }

      this.teams[this.currentIndex].members[memberIndex] = undefined

      this.loadingMembers[memberIndex] = false
      await this.calculateProduction(this.currentIndex)
    },
    async toggleCamp() {
      this.getCurrentTeam.camp = !this.getCurrentTeam.camp

      this.resetCurrentTeamSingleProduction()
      this.updateTeam()
      await this.calculateProduction(this.currentIndex)
    },
    async updateSleep(params: { bedtime: string; wakeup: string }) {
      const { bedtime, wakeup } = params
      this.getCurrentTeam.bedtime = bedtime
      this.getCurrentTeam.wakeup = wakeup

      this.resetCurrentTeamSingleProduction()
      this.updateTeam()
      await this.calculateProduction(this.currentIndex)
    },
    async updateRecipeType(recipeType: RecipeType) {
      this.getCurrentTeam.recipeType = recipeType

      this.updateTeam()
    },
    async updateFavoredBerries(berries: berry.Berry[]) {
      this.getCurrentTeam.favoredBerries = berries

      this.updateTeam()
    },
    resetCurrentTeamSingleProduction() {
      if (this.getCurrentTeam.production) {
        this.getCurrentTeam.production.members.forEach((member) => {
          if (member.singleProduction) {
            member.singleProduction = undefined
          }
        })
      }
    },
    isSupportMember(member: PokemonInstanceExt) {
      const hbOrErb = member.subskills.some(
        (s) =>
          (s.subskill.name.toLowerCase() === subskill.ENERGY_RECOVERY_BONUS.name.toLowerCase() ||
            s.subskill.name.toLowerCase() === subskill.HELPING_BONUS.name.toLowerCase()) &&
          s.level <= member.level
      )
      const supportSkill = [
        mainskill.ENERGIZING_CHEER_S,
        mainskill.ENERGY_FOR_EVERYONE,
        mainskill.HELPER_BOOST,
        mainskill.EXTRA_HELPFUL_S,
        mainskill.METRONOME
      ].some((s) => s.name.toLowerCase() === member.pokemon.skill.name.toLowerCase())

      return hbOrErb || supportSkill
    }
  },
  persist: true
})
