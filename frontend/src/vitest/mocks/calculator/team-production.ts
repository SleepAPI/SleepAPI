import type { TeamProductionExt } from '@/types/member/instanced'
import { createMockMemberProduction } from '@/vitest/mocks/calculator/member-production'
import { berry, curry, dessert, ingredient, salad } from 'sleepapi-common'

export function createMockTeamProduction(attrs?: Partial<TeamProductionExt>): TeamProductionExt {
  return {
    team: {
      cooking: {
        curry: {
          weeklyStrength: 1000,
          sundayStrength: 100,
          cookedRecipes: [
            {
              recipe: curry.INFERNO_CORN_KEEMA_CURRY,
              count: 1,
              sunday: 0,
              totalSkipped: 0,
              potLimited: { averageMissing: 0, count: 0 },
              ingredientLimited: []
            }
          ]
        },
        salad: {
          weeklyStrength: 1000,
          sundayStrength: 100,
          cookedRecipes: [
            {
              recipe: salad.GREENGRASS_SALAD,
              count: 1,
              sunday: 0,
              totalSkipped: 0,
              potLimited: { averageMissing: 0, count: 0 },
              ingredientLimited: []
            }
          ]
        },
        dessert: {
          weeklyStrength: 1000,
          sundayStrength: 100,
          cookedRecipes: [
            {
              recipe: dessert.FLOWER_GIFT_MACARONS,
              count: 1,
              sunday: 0,
              totalSkipped: 0,
              potLimited: { averageMissing: 0, count: 0 },
              ingredientLimited: []
            }
          ]
        }
      },
      berries: [{ amount: 10, berry: berry.BELUE }],
      ingredients: [{ amount: 10, ingredient: ingredient.FANCY_APPLE }]
    },
    members: [createMockMemberProduction()],
    ...attrs
  }
}
