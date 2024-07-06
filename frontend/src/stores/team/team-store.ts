import { TeamService } from '@/services/team/team-service'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useUserStore } from '@/stores/user-store'
import { MAX_TEAMS, MAX_TEAM_MEMBERS, type TeamInstance } from '@/types/member/instanced'
import { faker } from '@faker-js/faker/locale/en'
import { defineStore } from 'pinia'
import {
  DOMAIN_VERSION,
  uuid,
  type PokemonInstanceExt,
  type TeamSettingsRequest
} from 'sleepapi-common'

export interface TeamState {
  currentIndex: number
  maxAvailableTeams: number
  loadingTeams: boolean
  domainVersion: number
  teams: TeamInstance[]
}

export const useTeamStore = defineStore('team', {
  state: (): TeamState => ({
    currentIndex: 0,
    maxAvailableTeams: MAX_TEAMS,
    loadingTeams: true,
    domainVersion: 0,
    teams: [
      {
        index: 0,
        name: 'Log in to save your teams',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
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
    getTeamSize: (state) => state.teams[state.currentIndex].members.filter(Boolean).length
  },
  actions: {
    async populateTeams() {
      const userStore = useUserStore()
      const pokemonStore = usePokemonStore()

      if (userStore.loggedIn) {
        // TODO: very very messy
        try {
          this.loadingTeams = true

          // grab previous teams so we may compare it to updated teams from server
          const previousTeams = this.teams.map((team) => ({
            ...team,
            members: team.members.map((member) =>
              member ? pokemonStore.getPokemon(member) : undefined
            )
          }))
          // get updated teams from server
          // this also already updates the pokemon in pokemonStore
          const updatedTeams = await TeamService.getTeams()

          // overwrite cached teams with data from server
          this.teams = updatedTeams

          // loop through each team from server and compare it to previously cached teams
          for (const updatedTeam of updatedTeams) {
            const previousTeam = previousTeams.find((team) => team.index === updatedTeam.index)
            if (!previousTeam) {
              // first time user refreshes page since logging in
              this.calculateProduction(updatedTeam.index)
              continue
            }

            let rerunCalculations = false
            if (this.domainVersion < DOMAIN_VERSION) {
              rerunCalculations = true
              this.domainVersion = DOMAIN_VERSION
            }

            // if version of team mismatch, we re-sim
            if (updatedTeam.version !== previousTeam.version) {
              rerunCalculations = true
            }

            for (let i = 0; i < updatedTeam.members.length; i++) {
              const updatedMember = updatedTeam.members[i]
              const populatedUpdateMember = updatedMember
                ? pokemonStore.getPokemon(updatedMember)
                : undefined
              // if the member of this member index is not the same pokemon, we re-sim
              const previousMember = previousTeam.members.find(
                (member, previousIndex) =>
                  previousIndex === i && member?.externalId === populatedUpdateMember?.externalId
              )
              // the member is the same, but version mismatches we also re-sim
              if (populatedUpdateMember?.version !== previousMember?.version) {
                rerunCalculations = true
              }
            }

            if (rerunCalculations) {
              this.calculateProduction(updatedTeam.index)
            } else {
              this.teams[updatedTeam.index].production = previousTeam.production
            }
          }

          this.loadingTeams = false
        } catch (error) {
          console.error('Error fetching teams')
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
    randomName() {
      let name = faker.person.firstName()
      while (name.length > 12) {
        // TODO: we could save possible genders on each mon and pass, some mons can only be one gender, some have higher likelihood
        name = faker.person.firstName()
      }
      return name
    },
    async updateTeamName(updatedName: string) {
      this.teams[this.currentIndex].name = updatedName
      this.updateTeam()
    },
    async updateTeam() {
      const userStore = useUserStore()
      if (userStore.loggedIn) {
        try {
          await TeamService.createOrUpdateTeam(this.currentIndex, {
            name: this.getCurrentTeam.name,
            camp: this.getCurrentTeam.camp,
            bedtime: this.getCurrentTeam.bedtime,
            wakeup: this.getCurrentTeam.wakeup
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
      this.calculateProduction(this.currentIndex)
    },
    async calculateProduction(teamIndex: number) {
      const pokemonStore = usePokemonStore()
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

      const duplicatedMember: PokemonInstanceExt = {
        ...existingMember,
        version: 0,
        saved: false,
        externalId: uuid.v4(),
        name: this.randomName()
      }
      await this.updateTeamMember(duplicatedMember, openSlotIndex)
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
      this.calculateProduction(this.currentIndex)
    },
    toggleCamp() {
      this.getCurrentTeam.camp = !this.getCurrentTeam.camp
      this.updateTeam()
      this.calculateProduction(this.currentIndex)
    },
    updateSleep(params: { bedtime: string; wakeup: string }) {
      const { bedtime, wakeup } = params
      this.getCurrentTeam.bedtime = bedtime
      this.getCurrentTeam.wakeup = wakeup

      this.updateTeam()
      this.calculateProduction(this.currentIndex)
    },
    reset() {
      this.currentIndex = 0
      this.maxAvailableTeams = MAX_TEAMS
      this.loadingTeams = true
      this.domainVersion = 0
      this.teams = [
        {
          index: 0,
          name: 'Log in to save your teams',
          camp: false,
          bedtime: '21:30',
          wakeup: '06:00',
          version: 0,
          members: new Array(MAX_TEAM_MEMBERS).fill(undefined),
          production: undefined
        }
      ]
    }
  },
  persist: true
})
