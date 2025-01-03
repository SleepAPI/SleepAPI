import { teamMemberExt } from '@src/bun/mocks/team/mock-team-member-ext.js';
import type { SimpleTeamResult } from 'sleepapi-common';
import { mockIngredientSetFloatIndexed } from 'sleepapi-common';

export function simpleTeamResult(attrs?: Partial<SimpleTeamResult>): SimpleTeamResult {
  return {
    averageWeekdayPotSize: 0,
    critMultiplier: 2,
    ingredientPercentage: 20,
    member: teamMemberExt(),
    skillIngredients: mockIngredientSetFloatIndexed(),
    skillProcs: 0,
    totalHelps: 0,
    ...attrs
  };
}
