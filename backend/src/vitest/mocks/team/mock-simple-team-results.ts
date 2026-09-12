import { teamMember } from '@src/vitest/mocks/team/mock-team-member-ext.js';
import type { SimpleTeamResult } from 'sleepapi-common';
import { commonMocks } from 'sleepapi-common';

export function simpleTeamResult(attrs?: Partial<SimpleTeamResult>): SimpleTeamResult {
  return {
    averageWeekdayPotSize: 0,
    critMultiplier: 2,
    ingredientPercentage: 20,
    member: teamMember(),
    skillIngredients: commonMocks.mockIngredientSetFloatIndexed(),
    skillProcs: 0,
    totalHelps: 0,
    ...attrs
  };
}
