import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { EnergizingCheerSNuzzle } from 'sleepapi-common';

export class EnergizingCheerSNuzzleEffect implements SkillEffect {
  activate(skillState: SkillState, recursionDepth: number = 0): SkillActivation {
    const skill = EnergizingCheerSNuzzle;
    const invoker = skillState.memberState;
    const energyAmount = skillState.skillAmount(skill.activations.energy);
    const skillHelpsAmount = skillState.skillAmount(skill.activations.skillHelps);

    const targetedMon = skillState.findTargetMon(skill.targeting);
    const recovered = targetedMon.recoverEnergy(energyAmount, invoker).recovered;
    const bonusActivations = targetedMon.addSkillHelps(skillHelpsAmount, invoker, recursionDepth);

    return {
      skill,
      activations: [
        {
          unit: 'energy',
          team: { regular: recovered, crit: 0 }
        },
        {
          unit: 'skill helps',
          team: { regular: skillHelpsAmount, crit: bonusActivations }
        }
      ],
      targeting: skill.targeting
    };
  }
}
