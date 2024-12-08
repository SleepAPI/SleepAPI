import { mockCookingResult } from '@src/vitest/mocks/team/mock-cooking-result.js';
import { TeamResults } from 'sleepapi-common';

export function mockTeamResults(attrs?: Partial<TeamResults>): TeamResults {
  return {
    members: [],
    cooking: mockCookingResult(),
    ...attrs
  };
}
