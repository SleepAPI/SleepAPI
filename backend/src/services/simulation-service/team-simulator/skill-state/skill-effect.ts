import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';

export interface SkillEffect {
  activate(skillState: SkillState, recursionDepth?: number): SkillActivation;
}
