import { berrySet } from '@src/bun/mocks/berry/mock-berry-set.js';
import { pokemonWithIngredientsIndexed } from '@src/bun/mocks/pokemon/mock-pokemon-with-ingredients.js';
import { produce } from '@src/bun/mocks/produce/mock-produce.js';
import type { MemberProduction, MemberProductionAdvanced } from 'sleepapi-common';

export function memberProduction(attrs?: Partial<MemberProduction>): MemberProduction {
  return {
    advanced: memberProductionAdvanced(),
    externalId: 'Mock id',
    pokemonWithIngredients: pokemonWithIngredientsIndexed(),
    produceFromSkill: produce(),
    produceTotal: produce(),
    produceWithoutSkill: produce(),
    skillAmount: 0,
    skillProcs: 0,
    ...attrs
  };
}

export function memberProductionAdvanced(attrs?: Partial<MemberProductionAdvanced>): MemberProductionAdvanced {
  return {
    averageHelps: 0,
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
    sneakySnack: berrySet(),
    spilledIngredients: [],
    totalHelps: 0,
    totalRecovery: 0,
    wastedEnergy: 0,
    ...attrs
  };
}
