import { mockBerrySet } from '@src/vitest/mocks/berry/mock-berry-set.js';
import { pokemonWithIngredientsIndexed } from '@src/vitest/mocks/pokemon/mock-pokemon-with-ingredients.js';
import { mockProduce } from '@src/vitest/mocks/produce/mock-produce.js';
import { MemberProduction, MemberProductionAdvanced } from 'sleepapi-common';

export function mockMemberProduction(attrs?: Partial<MemberProduction>): MemberProduction {
  return {
    advanced: mockMemberProductionAdvanced(),
    externalId: 'Mock id',
    pokemonWithIngredients: pokemonWithIngredientsIndexed(),
    produceFromSkill: mockProduce(),
    produceTotal: mockProduce(),
    produceWithoutSkill: mockProduce(),
    skillAmount: 0,
    skillProcs: 0,
    ...attrs
  };
}

export function mockMemberProductionAdvanced(attrs?: Partial<MemberProductionAdvanced>): MemberProductionAdvanced {
  return {
    carrySize: 0,
    dayHelps: 0,
    ingredientPercentage: 0,
    morningProcs: 0,
    nightHelps: 0,
    nightHelpsAfterSS: 0,
    nightHelpsBeforeSS: 0,
    skillCrits: 0,
    skillCritValue: 0,
    skillPercentage: 0,
    sneakySnack: mockBerrySet(),
    spilledIngredients: [],
    totalHelps: 0,
    totalRecovery: 0,
    wastedEnergy: 0,
    ...attrs
  };
}
