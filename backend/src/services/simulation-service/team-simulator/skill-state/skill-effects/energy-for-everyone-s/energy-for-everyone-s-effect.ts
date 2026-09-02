import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { EnergyForEveryoneS } from 'sleepapi-common';

export class EnergyForEveryoneSEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = EnergyForEveryoneS;
    const invoker = skillState.memberState;
    const energyAmount = skillState.skillAmount(skill.activations.energy);

    let recovered = 0;
    for (const member of [invoker, ...invoker.otherMembers]) {
      recovered += member.recoverEnergy(energyAmount, invoker).recovered;
    }

    return {
      skill,
      activations: [
        {
          unit: 'energy',
          team: { regular: recovered, crit: 0 }
        }
      ]
    };
  }
}
