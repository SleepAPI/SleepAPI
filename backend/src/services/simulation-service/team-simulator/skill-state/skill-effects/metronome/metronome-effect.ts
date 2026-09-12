import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { Metronome } from 'sleepapi-common';

export class MetronomeEffect implements SkillEffect {
  activate(skillState: SkillState, recursionDepth?: number): SkillActivation {
    const selectedSkill = skillState.rng.randomElement(Metronome.metronomeSkills);

    const metronomedSkill = skillState.skillEffects.get(selectedSkill)?.activate(skillState, recursionDepth);
    if (!metronomedSkill) {
      logger.error(`[${skillState.skill.name}] Couldn't trigger metronome on ${selectedSkill?.name}`);
      return { skill: skillState.skill, activations: [] };
    }

    return metronomedSkill;
  }
}
