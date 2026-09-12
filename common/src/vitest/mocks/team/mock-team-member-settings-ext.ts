import { BASHFUL } from '../../../types/nature';
import type { TeamMemberSettings } from '../../../types/team/member';

export function teamMemberSettings(attrs?: Partial<TeamMemberSettings>): TeamMemberSettings {
  return {
    carrySize: 1,
    externalId: 'mock id',
    level: 1,
    nature: BASHFUL,
    ribbon: 0,
    skillLevel: 1,
    subskills: new Set(),
    sneakySnacking: false,
    ...attrs
  };
}
