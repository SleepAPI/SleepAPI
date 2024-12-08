import { SimpleTeamResult } from '@src/services/api-service/production/production-service.js';
import { mockTeamMemberExt } from '@src/vitest/mocks/team/mock-team-member-ext.js';

export function mockSimpleTeamResult(attrs?: Partial<SimpleTeamResult>): SimpleTeamResult {
  return {
    critMultiplier: 2,
    ingredientPercentage: 20,
    member: mockTeamMemberExt(),
    skillIngredients: [],
    skillProcs: 0,
    totalHelps: 0,
    ...attrs
  };
}
