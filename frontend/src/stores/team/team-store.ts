import { PokemonInstanceUtils } from '@/services/utils/pokemon-instance-utils'
import { TeamService } from '@/services/team/team-service'
import { randomName } from '@/services/utils/name-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useUserStore } from '@/stores/user-store'
import {
  MAX_TEAMS,
  type MemberProductionExt,
  type PerformanceDetails,
  type TeamInstance
} from '@/types/member/instanced'
import type { TeamData } from '@/types/team/team-data'
import { timeWindowFactor, type TimeWindowDay } from '@/types/time/time-window'
import { defineStore } from 'pinia'
import {
  DEFAULT_ISLAND,
  DOMAIN_VERSION,
  EnergizingCheerS,
  EnergizingCheerSHealPulse,
  EnergyForEveryoneS,
  ExtraHelpfulS,
  HelperBoost,
  MAX_TEAM_SIZE,
  Metronome,
  subskill,
  uuid,
  type BerrySetSimple,
  type IngredientSetSimple,
  type IslandInstance,
  type PokemonInstanceExt,
  type RecipeType,
  type TeamAreaDTO,
  type TeamSettings
} from 'sleepapi-common'
import type { TeamScheduleShift, TeamScheduleType } from 'sleepapi-common'

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

const defaultState = (attrs?: Partial<TeamState>): TeamState => ({
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
      name: 'Team 1',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      recipeType: 'curry',
      island: { ...DEFAULT_ISLAND },
      stockpiledBerries: [],
      stockpiledIngredients: [],
      version: 0,
      members: new Array(MAX_TEAM_SIZE).fill(undefined),
      schedule: [],
      memberIvs: {},
      production: undefined
    }
  ],
  ...attrs
})

export const useTeamStore = defineStore('team', {
  // NOTE: If state is changed, migration/outdate must be updated
  state: (): TeamState => defaultState(),
  getters: {
    getCurrentTeam: (state: TeamState) => state.teams[state.currentIndex],
    getPokemon: (state) => {
      return (memberIndex: number) => {
        const pokemonStore = usePokemonStore()
        const pokemonExternalId = state.teams[state.currentIndex].members[memberIndex]
        return pokemonExternalId != null ? pokemonStore.getPokemon(pokemonExternalId) : undefined
      }
    },
    getTeamSize: (state: TeamState) => state.teams[state.currentIndex].members.filter(Boolean).length,
    getMemberLoading(state) {
      return (memberIndex: number) => {
        return state.loadingMembers[memberIndex]
      }
    },
    getCurrentMember: (state: TeamState) => {
      const currentTeam = state.teams[state.currentIndex]
      const ids = [...currentTeam.members, ...(currentTeam.schedule ?? []).map((shift) => shift.externalId)]
      return currentTeam.selectedMemberId && ids.includes(currentTeam.selectedMemberId)
        ? currentTeam.selectedMemberId
        : (currentTeam.members.at(currentTeam.memberIndex) ?? ids.find(Boolean))
    },
    getMemberIvLoading: (state: TeamState) => (externalId: string) => {
      const currentTeam = state.teams[state.currentIndex]
      // member is loading if key exists, but value is undefined
      if (externalId in currentTeam.memberIvs) {
        return currentTeam.memberIvs[externalId] === undefined
      } else return false
    },
    getCurrentMembersWithProduction: (state: TeamState) => {
      const pokemonStore = usePokemonStore()

      const currentTeam = state.teams[state.currentIndex]
      const result: (MemberProductionExt | undefined)[] = []
      const memberIds = currentTeam.production?.members.map((member) => member.externalId) ?? currentTeam.members
      for (const memberId of memberIds) {
        const memberInstance = memberId && pokemonStore.getPokemon(memberId)
        const production = currentTeam.production?.members.find((member) => member.externalId === memberId)

        if (!memberId || !memberInstance || !production) {
          result.push(undefined)
          continue
        }

        const iv: PerformanceDetails | undefined = state.teams[state.currentIndex].memberIvs[memberId]

        result.push({
          member: memberInstance,
          production,
          iv
        })
      }
      return result
    },
    timeWindowFactor: (state: TeamState) => timeWindowFactor(state.timeWindow)
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
        if (!team.memberIvs) {
          team.memberIvs = {}
        }
        if (!team.stockpiledBerries) {
          team.stockpiledBerries = []
        }
        if (!team.stockpiledIngredients) {
          team.stockpiledIngredients = []
        }
        if (!team.island) {
          team.island = { ...DEFAULT_ISLAND }
        }
        if (!team.schedule) {
          team.schedule = []
        }
      }
    },
    invalidateCache() {
      if (this.domainVersion !== DOMAIN_VERSION) {
        for (const team of this.teams) {
          team.production = undefined
          team.memberIvs = {}
        }
        const updatedKeys = Object.keys(defaultState()) as Array<keyof TeamState>
        const cachedKeys = Object.keys(this.$state) as Array<keyof TeamState>

        cachedKeys.forEach((key) => {
          if (!updatedKeys.includes(key)) {
            delete this.$state[key]
          }
        })

        this.domainVersion = DOMAIN_VERSION
      }
    },
    async syncTeams() {
      const userStore = useUserStore()
      const pokemonStore = usePokemonStore()

      if (userStore.loggedIn) {
        // grab previous teams so we may compare it to updated teams from server
        const previousTeams = this.teams.map((team) => ({
          ...team,
          members: team.members.map((member) => (member ? pokemonStore.getPokemon(member) : undefined)),
          scheduledMembers: (team.schedule ?? []).map((shift) => pokemonStore.getPokemon(shift.externalId))
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
              const populatedUpdateMember = updatedMember ? pokemonStore.getPokemon(updatedMember) : undefined

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
            memberUpdated ||= (serverTeam.schedule ?? []).some((shift) => {
              const previous = previousTeam.scheduledMembers.find((pokemon) => pokemon?.externalId === shift.externalId)
              return !previous || previous.version !== pokemonStore.getPokemon(shift.externalId)?.version
            })
            if (!memberUpdated) {
              this.teams[serverTeam.index].production = previousTeam.production
              this.teams[serverTeam.index].memberIvs = previousTeam.memberIvs
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
    async setCurrentTeam(teamData: TeamData) {
      this.currentIndex = teamData.index
      await this.deleteTeam()

      // Make sure team exists before adding members
      this.teams[this.currentIndex] = {
        ...teamData,
        members: teamData.members.map((member) => member.externalId),
        schedule: [],
        memberIvs: {},
        production: undefined,
        version: 0
      }
      await this.updateTeam()

      for (let i = 0; i < MAX_TEAM_SIZE; i++) {
        const maybeMember = teamData.members.at(i)
        if (maybeMember) {
          await this.updateTeamMember(maybeMember, i, false)
        }
      }
    },
    async updateTeam() {
      const userStore = useUserStore()
      if (userStore.loggedIn) {
        try {
          const {
            island,
            name,
            camp,
            bedtime,
            wakeup,
            recipeType,
            stockpiledBerries,
            stockpiledIngredients,
            schedule
          } = this.getCurrentTeam

          const islandDTO: TeamAreaDTO = {
            islandName: island.shortName,
            favoredBerries: island.berries.map((b) => b.name).join(','),
            expertModifier: island.expertMode?.randomBonus,
            mainFavoriteBerry: island.expertMode?.mainFavoriteBerry.name,
            subFavoriteBerries: island.expertMode?.subFavoriteBerries.map((b) => b.name).join(',')
          }

          const { version } = await TeamService.createOrUpdateTeam(this.currentIndex, {
            name,
            camp,
            bedtime,
            wakeup,
            recipeType,
            island: islandDTO,
            stockpiledBerries,
            stockpiledIngredients,
            schedule,
            scheduledMembers: [...new Set((schedule ?? []).map((shift) => shift.externalId))].map((id) => {
              const pokemon = usePokemonStore().getPokemon(id)
              if (!pokemon) throw new Error(`Scheduled Pokémon ${id} is missing`)
              return PokemonInstanceUtils.toUpsertTeamMemberRequest(pokemon)
            })
          })

          this.getCurrentTeam.version = version
        } catch {
          logger.error('Error updating teams')
        }
      }
    },
    async deleteTeam() {
      const userStore = useUserStore()

      const newName = `Helper team ${this.currentIndex + 1}`

      this.teams[this.currentIndex] = {
        index: this.currentIndex,
        memberIndex: 0,
        camp: false,
        name: newName,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        island: { ...DEFAULT_ISLAND },
        stockpiledBerries: [],
        stockpiledIngredients: [],
        version: 0,
        members: new Array(MAX_TEAM_SIZE).fill(undefined),
        schedule: [],
        memberIvs: {},
        production: undefined
      }

      if (userStore.loggedIn) {
        try {
          await TeamService.deleteTeam(this.currentIndex)
        } catch {
          logger.error('Error updating teams')
        }
      }
    },
    selectMember(externalId: string) {
      this.getCurrentTeam.selectedMemberId = externalId
      const slotIndex = this.getCurrentTeam.members.indexOf(externalId)
      if (slotIndex >= 0) this.getCurrentTeam.memberIndex = slotIndex
    },
    async updateMemberById(updatedMember: PokemonInstanceExt) {
      const slotIndex = this.getCurrentTeam.members.indexOf(updatedMember.externalId)
      if (slotIndex >= 0) return this.updateTeamMember(updatedMember, slotIndex)
      if (!(this.getCurrentTeam.schedule ?? []).some((shift) => shift.externalId === updatedMember.externalId)) return
      usePokemonStore().upsertLocalPokemon(updatedMember)
      await this.updateTeam()
      this.resetCurrentTeamIvs()
      await this.calculateProduction(this.currentIndex)
    },
    async updateTeamMember(updatedMember: PokemonInstanceExt, memberIndex: number, calculateProduction = true) {
      this.loadingMembers[memberIndex] = true

      const userStore = useUserStore()
      const pokemonStore = usePokemonStore()

      pokemonStore.upsertLocalPokemon(updatedMember)

      if (userStore.loggedIn) {
        try {
          // TODO: there's probably a better solution to this, but this ensures the server has the team created before we add members
          if (this.getCurrentTeam.version === 0) {
            await this.updateTeam()
          }

          await TeamService.createOrUpdateMember({
            teamIndex: this.currentIndex,
            memberIndex,
            member: updatedMember
          })
        } catch {
          logger.error('Error updating teams')
        }
      }

      this.teams[this.currentIndex].members[memberIndex] = updatedMember.externalId

      if (calculateProduction) {
        await this.calculateProduction(this.currentIndex)
        // reset single production to trigger radar chart recalc
        if (this.isSupportMember(updatedMember)) {
          this.resetCurrentTeamIvs()
        } else {
          delete this.getCurrentTeam.memberIvs[updatedMember.externalId]
        }
      }

      this.loadingMembers[memberIndex] = false
    },
    // setting to undefined indicates a calculation has started and we're awaiting value
    upsertIv(externalId: string, performanceDetails?: PerformanceDetails) {
      this.getCurrentTeam.memberIvs[externalId] = performanceDetails
    },
    async calculateProduction(teamIndex: number) {
      const pokemonStore = usePokemonStore()
      this.loadingTeams = true

      const members: PokemonInstanceExt[] = []
      const memberIds = new Set(this.teams[teamIndex].members.filter(Boolean) as string[])
      for (const shift of this.teams[teamIndex].schedule ?? []) {
        memberIds.add(shift.externalId)
      }
      for (const member of memberIds) {
        if (member) {
          const pokemon = pokemonStore.getPokemon(member)
          pokemon && members.push(pokemon)
        }
      }
      const settings: TeamSettings = {
        camp: this.teams[teamIndex].camp,
        bedtime: this.teams[teamIndex].bedtime,
        wakeup: this.teams[teamIndex].wakeup,
        stockpiledIngredients: this.teams[teamIndex].stockpiledIngredients,
        island: this.teams[teamIndex].island,
        schedule: Array.from({ length: MAX_TEAM_SIZE }).flatMap((_, slotIndex) => {
          const explicit = (this.teams[teamIndex].schedule ?? []).filter((shift) => shift.slotIndex === slotIndex)
          if (explicit.length > 0) return explicit
          const primaryId = this.teams[teamIndex].members[slotIndex]
          return primaryId ? [{ slotIndex, externalId: primaryId, startTime: this.teams[teamIndex].wakeup }] : []
        })
      }
      this.teams[teamIndex].production = await TeamService.calculateProduction({
        members,
        settings
      })

      this.loadingTeams = false
    },
    async duplicateMember(memberIndex: number) {
      const existingMember = this.getPokemon(memberIndex)
      const currentTeam = this.getCurrentTeam

      const openSlotIndex = currentTeam.members.findIndex((member) => member == null) // checks for both null and undefined
      if (openSlotIndex === -1 || existingMember == null) {
        logger.error("No open slot or member can't be found")
        return
      }
      this.loadingMembers[openSlotIndex] = true

      const duplicatedMember: PokemonInstanceExt = {
        ...existingMember,
        version: 0,
        saved: false,
        externalId: uuid.v4(),
        name: randomName(existingMember.pokemon, 12, existingMember.gender)
      }
      await this.updateTeamMember(duplicatedMember, openSlotIndex)
      this.loadingMembers[openSlotIndex] = false
    },
    getSchedule(slotIndex: number): TeamScheduleShift[] {
      const primaryId = this.getCurrentTeam.members[slotIndex]
      const explicit = (this.getCurrentTeam.schedule ?? []).filter((shift) => shift.slotIndex === slotIndex)
      if (explicit.length > 0) {
        const [wakeupHour, wakeupMinute] = this.getCurrentTeam.wakeup.split(':').map(Number)
        const wakeupMinutes = wakeupHour * 60 + wakeupMinute
        const minutesSinceWakeup = (time: string) => {
          const [hour, minute] = time.split(':').map(Number)
          return (hour * 60 + minute - wakeupMinutes + 1440) % 1440
        }
        return explicit.slice().sort((a, b) => minutesSinceWakeup(a.startTime) - minutesSinceWakeup(b.startTime))
      }
      return primaryId ? [{ slotIndex, externalId: primaryId, startTime: this.getCurrentTeam.wakeup }] : []
    },
    getScheduleType(slotIndex: number): TeamScheduleType {
      return this.getSchedule(slotIndex)[0]?.type ?? 'time'
    },
    async setSchedule(slotIndex: number, shifts: TeamScheduleShift[]) {
      this.getCurrentTeam.schedule = [
        ...(this.getCurrentTeam.schedule ?? []).filter((shift) => shift.slotIndex !== slotIndex),
        ...shifts
      ]
      await this.updateTeam()
      await this.calculateProduction(this.currentIndex)
    },
    async removeMember(memberIndex: number, calculateProduction = true) {
      this.loadingMembers[memberIndex] = true

      const userStore = useUserStore()
      const pokemonStore = usePokemonStore()

      // if the current member is removed, we highlight the first found member
      if (memberIndex === this.getCurrentTeam.memberIndex) {
        const newIndex = this.getCurrentTeam.members.findIndex((member, i) => i !== memberIndex && member != null)
        this.getCurrentTeam.memberIndex = newIndex !== -1 ? newIndex : 0
      }

      if (userStore.loggedIn) {
        try {
          TeamService.removeMember({
            teamIndex: this.currentIndex,
            memberIndex
          })
        } catch {
          logger.error('Error updating teams')
        }
      }

      const member = this.getPokemon(memberIndex) // grab mon

      this.teams[this.currentIndex].members[memberIndex] = undefined // remove mon from team
      // A rotation belongs to its visible slot. Leaving secondary shifts behind after
      // its primary is removed makes the empty slot impossible to reclaim.
      this.getCurrentTeam.schedule = (this.getCurrentTeam.schedule ?? []).filter(
        (shift) => shift.slotIndex !== memberIndex
      )
      if (member != null) {
        if (this.isSupportMember(member)) {
          this.resetCurrentTeamIvs()
        }
        pokemonStore.removePokemon(member.externalId, 'team')
      }

      this.loadingMembers[memberIndex] = false
      await this.updateTeam()
      if (calculateProduction) {
        await this.calculateProduction(this.currentIndex)
      }
    },
    async toggleCamp() {
      this.getCurrentTeam.camp = !this.getCurrentTeam.camp

      this.updateTeam()
      await this.calculateProduction(this.currentIndex)
      this.resetCurrentTeamIvs() // reset after production is available
    },
    async updateStockpile(params: { ingredients: IngredientSetSimple[]; berries: BerrySetSimple[] }) {
      const { ingredients, berries } = params
      this.getCurrentTeam.stockpiledIngredients = ingredients
      this.getCurrentTeam.stockpiledBerries = berries

      this.updateTeam()
      await this.calculateProduction(this.currentIndex)
    },
    async updateSleep() {
      this.updateTeam()
      await this.calculateProduction(this.currentIndex)
      this.resetCurrentTeamIvs() // reset after production is available
    },
    async updateRecipeType(recipeType: RecipeType) {
      this.getCurrentTeam.recipeType = recipeType

      this.updateTeam()
    },
    async updateIsland(island: IslandInstance) {
      this.getCurrentTeam.island = island

      this.updateTeam()
      await this.calculateProduction(this.currentIndex)
      this.resetCurrentTeamIvs() // reset after production is available
    },
    clearCalculatorCache() {
      for (const team of this.teams) {
        team.production = undefined
      }
    },
    resetCurrentTeamIvs() {
      this.getCurrentTeam.memberIvs = {}
    },
    isSupportMember(member: PokemonInstanceExt) {
      const hbOrErb = member.subskills.some(
        (s) =>
          (s.subskill.name.toLowerCase() === subskill.ENERGY_RECOVERY_BONUS.name.toLowerCase() ||
            s.subskill.name.toLowerCase() === subskill.HELPING_BONUS.name.toLowerCase()) &&
          s.level <= member.level
      )
      const supportSkill = [
        EnergizingCheerS,
        EnergizingCheerSHealPulse,
        EnergyForEveryoneS,
        HelperBoost,
        ExtraHelpfulS,
        Metronome
      ].some((s) => s.name.toLowerCase() === member.pokemon.skill.name.toLowerCase())

      return hbOrErb || supportSkill
    }
  },
  persist: true
})
