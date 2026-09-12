import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { EnergizingCheerS } from 'sleepapi-common';

export class EnergizingCheerSEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = EnergizingCheerS;
    const invoker = skillState.memberState;
    const energyAmount = skillState.skillAmount(skill.activations.energy);

    const targetedMon = skillState.findTargetMon(skill.targeting);
    let recovered = 0;
    recovered += targetedMon.recoverEnergy(energyAmount, invoker).recovered;

    return {
      skill,
      activations: [
        {
          unit: 'energy',
          team: { regular: recovered, crit: 0 }
        }
      ],
      targeting: skill.targeting
    };
  }
}
