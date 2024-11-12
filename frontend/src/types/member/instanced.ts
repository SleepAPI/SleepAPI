import type {
  BerrySet,
  CookingResult,
  IngredientSet,
  MemberProduction,
  PokemonInstanceExt,
  RecipeType,
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

export interface MemberProductionExt {
  member: PokemonInstanceExt
  production: MemberProduction
  iv?: PerformanceDetails
}

export interface SingleProductionExt {
  externalId: string
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
  members: MemberProduction[]
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
  memberIvs: Record<string, PerformanceDetails | undefined>
  production?: TeamProductionExt
}

export const MAX_TEAM_MEMBERS = 5
export const MAX_TEAMS = 10
export const DEFAULT_SLEEP = {
  bedtime: '21:30',
  wakeup: '06:00'
}
