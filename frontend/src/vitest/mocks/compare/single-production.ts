import type { SingleProductionExt } from '@/types/member/instanced'
import { createMockPokemon } from '@/vitest/mocks/pokemon-instance'
import { ingredient } from 'sleepapi-common'

export function createMockSingleProduction(
  attrs?: Partial<SingleProductionExt>
): SingleProductionExt {
  const mockPokemon = createMockPokemon()
  return {
    memberExternalId: mockPokemon.externalId,
    ingredients: [
      {
        amount: 10,
        ingredient: ingredient.FANCY_APPLE
      },
      {
        amount: 20,
        ingredient: ingredient.HONEY
      }
    ],
    skillProcs: 5,
    berries: [
      {
        amount: 100,
        berry: mockPokemon.pokemon.berry,
        level: mockPokemon.level
      }
    ],
    ingredientPercentage: 0.2,
    skillPercentage: 0.02,
    carrySize: 10,
    averageEnergy: 10,
    averageFrequency: 10,
    dayHelps: 10,
    nightHelps: 10,
    nrOfHelps: 10,
    sneakySnackHelps: 10,
    spilledIngredients: [],
    totalRecovery: 10,
    sneakySnack: [],
    ...attrs
  }
}
