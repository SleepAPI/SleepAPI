import type {
  BerrySet,
  CookingResult,
  DetailedProduce,
  IngredientSet,
  MemberProduction,
  PokemonInstanceExt,
  RecipeType,
  Summary,
  Time,
  berry
} from 'sleepapi-common'

export interface TeamCombinedProduction {
  berries: BerrySet[]
  ingredients: IngredientSet[]
  cooking: CookingResult
}

export interface PerformanceDetails {
  berry: number
  skill: number
  ingredient: number
  ingredientsOfTotal: number[]
}
export interface PerformanceAnalysis {
  neutral: PerformanceDetails
  user: PerformanceDetails
  optimal: PerformanceDetails
}
export interface SingleMemberProduction {
  summary: Summary
  detailedProduce: DetailedProduce
  performanceAnalysis: PerformanceAnalysis
}

export interface MemberProductionExt extends MemberProduction {
  memberExternalId: string
  singleProduction?: SingleMemberProduction
}

export interface MemberInstanceProductionExt extends MemberProductionExt {
  pokemonInstance: PokemonInstanceExt
  ingredients: { amount: number; name: string }[]
}

export interface SingleProductionExt {
  memberExternalId: string
  berries: BerrySet[]
  ingredients: IngredientSet[]
  skillProcs: number
  ingredientPercentage: number
  skillPercentage: number
  carrySize: number
  spilledIngredients: IngredientSet[]
  sneakySnack: BerrySet[]
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
  memberIndex: number
  name: string
  camp: boolean
  bedtime: string
  wakeup: string
  recipeType: RecipeType
  favoredBerries: berry.Berry[]
  version: number
  members: (string | undefined)[]
  production?: TeamProductionExt
}

export const MAX_TEAM_MEMBERS = 5
export const MAX_TEAMS = 10
export const DEFAULT_SLEEP = {
  bedtime: '21:30',
  wakeup: '06:00'
}
