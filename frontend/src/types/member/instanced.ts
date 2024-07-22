import type { BerrySet, IngredientSet, PokemonInstanceExt } from 'sleepapi-common'

export interface TeamCombinedProduction {
  // TODO: expand
  // TODO: probably like a skill proc array with procs and skill?
  berries: BerrySet[]
  ingredients: IngredientSet[]
}

// TODO: expand
export interface MemberProductionExt {
  berries?: BerrySet
  ingredients: IngredientSet[]
  skillProcs: number
  member: PokemonInstanceExt
}
export interface TeamProductionExt {
  team: TeamCombinedProduction
  members: MemberProductionExt[]
}
export interface TeamInstance {
  index: number
  name: string
  camp: boolean
  bedtime: string
  wakeup: string
  version: number
  members: (string | undefined)[]
  production?: TeamProductionExt
}

export const MAX_TEAM_MEMBERS = 5
export const MAX_TEAMS = 5
export const DEFAULT_SLEEP = {
  bedtime: '21:30',
  wakeup: '06:00'
}
