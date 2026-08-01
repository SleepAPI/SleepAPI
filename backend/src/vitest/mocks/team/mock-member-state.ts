import { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { createPreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import { mocks } from '@src/vitest/index.js';
import { teamMember } from '@src/vitest/mocks/team/mock-team-member-ext.js';

export function memberState(attrs?: Partial<MemberState>): MemberState {
  return new MemberState({
    member: teamMember(),
    settings: mocks.teamSettings(),
    team: [teamMember()],
    cookingState: undefined,
    iterations: 1,
    rng: createPreGeneratedRandom(),
    ...attrs
  });
}
