import type { ingredient, nature, pokemon, subskill } from 'sleepapi-common'

export interface InstancedIngredientExt {
  level: number
  ingredient: ingredient.Ingredient
}
export interface InstancedSubskillExt {
  level: number
  subskill: subskill.SubSkill
}
export interface InstancedPokemonExt {
  index: number
  version: number // TODO: maybe this should just be optional too, easier to use with in memory templates
  saved: boolean
  externalId?: string
  pokemon: pokemon.Pokemon
  name: string
  level: number
  carrySize: number
  skillLevel: number
  nature: nature.Nature
  subskills: InstancedSubskillExt[]
  ingredients: InstancedIngredientExt[]
}
export interface InstancedTeamExt {
  index: number
  name: string
  camp: boolean
  version: number

  members: (InstancedPokemonExt | undefined)[]
}

export const MAX_TEAM_MEMBERS = 5
export const MAX_TEAMS = 5
