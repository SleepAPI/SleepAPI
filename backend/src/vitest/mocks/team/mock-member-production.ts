import { pokemonWithIngredientsIndexed } from '@src/vitest/mocks/pokemon/mock-pokemon-with-ingredients.js';
import { produce } from '@src/vitest/mocks/produce/mock-produce.js';
import type { MemberSkillValue } from 'sleepapi-common';
import {
  commonMocks,
  mainskillUnits,
  type MemberProduction,
  type MemberProductionAdvanced,
  type MemberStrength
} from 'sleepapi-common';

const defaultStrength: MemberStrength = {
  berries: {
    total: 0,
    breakdown: {
      base: 0,
      favored: 0,
      islandBonus: 0
    }
  },
  skill: {
    total: 0,
    breakdown: {
      base: 0,
      islandBonus: 0
    }
  }
};

export function memberProduction(attrs?: Partial<MemberProduction>): MemberProduction {
  const production: MemberProduction = {
    advanced: memberProductionAdvanced(),
    externalId: 'Mock id',
    pokemonWithIngredients: pokemonWithIngredientsIndexed(),
    produceFromSkill: produce(),
    produceTotal: produce(),
    produceWithoutSkill: produce(),
    skillLevel: 1,
    skillProcs: 0,
    skillValue: Object.fromEntries(
      mainskillUnits.map((key) => [key, { amountToSelf: 0, amountToTeam: 0 }])
    ) as MemberSkillValue,
    strength: defaultStrength
  };

  if (attrs) {
    Object.assign(production, attrs);
    production.strength = attrs.strength ?? production.strength;
  }

  return production;
}

export function memberProductionAdvanced(attrs?: Partial<MemberProductionAdvanced>): MemberProductionAdvanced {
  return {
    averageHelps: 0,
    carrySize: 0,
    maxFrequency: 0,
    dayHelps: 0,
    ingredientPercentage: 0,
    morningProcs: 0,
    nightHelps: 0,
    nightHelpsAfterSS: 0,
    nightHelpsBeforeSS: 0,
    skillCrits: 0,
    skillPercentage: 0,
    berryProductionDistribution: {},
    ingredientDistributions: {},
    frequencySplit: {
      eighty: 0,
      sixty: 0,
      forty: 0,
      one: 0,
      zero: 0
    },
    skillProcDistribution: {},
    teamSupport: {
      energy: 0,
      helps: 0
    },
    sneakySnack: commonMocks.mockBerrySet(),
    dayPeriod: {
      averageEnergy: 0,
      averageFrequency: 0,
      spilledIngredients: []
    },
    nightPeriod: {
      averageEnergy: 0,
      averageFrequency: 0,
      spilledIngredients: []
    },
    totalHelps: 0,
    totalRecovery: 0,
    wastedEnergy: 0,
    ...attrs
  };
}
