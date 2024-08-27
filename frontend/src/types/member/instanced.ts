import type { BerrySet, IngredientSet, PokemonInstanceExt, Time } from 'sleepapi-common'

export interface TeamCombinedProduction {
  berries: BerrySet[]
  ingredients: IngredientSet[]
}

export interface MemberProductionExt {
  berries?: BerrySet
  ingredients: IngredientSet[]
  skillProcs: number
  member: PokemonInstanceExt
}

export interface SingleProductionExt extends MemberProductionExt {
  ingredientPercentage: number
  skillPercentage: number
  carrySize: number
  spilledIngredients: IngredientSet[]
  sneakySnack?: BerrySet
  nrOfHelps: number
  dayHelps: number
  nightHelps: number
  sneakySnackHelps: number
  totalRecovery: number
  averageEnergy: number
  averageFrequency: number
  collectFrequency?: Time
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
