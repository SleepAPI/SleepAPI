import type { ingredient, nature, pokemon, subskill } from 'sleepapi-common'

export interface IngredientInstanceExt {
  level: number
  ingredient: ingredient.Ingredient
}
export interface SubskillInstanceExt {
  level: number
  subskill: subskill.SubSkill
}
export interface PokemonInstanceExt {
  version: number
  saved: boolean
  externalId: string
  pokemon: pokemon.Pokemon
  name: string
  level: number
  carrySize: number
  skillLevel: number
  nature: nature.Nature
  subskills: SubskillInstanceExt[]
  ingredients: IngredientInstanceExt[]
}

export interface TeamInstance {
  index: number
  name: string
  camp: boolean
  version: number
  members: (string | undefined)[]
}

export const MAX_TEAM_MEMBERS = 5
export const MAX_TEAMS = 5
