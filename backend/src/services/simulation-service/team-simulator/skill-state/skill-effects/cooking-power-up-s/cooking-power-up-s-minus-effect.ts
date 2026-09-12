import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { CookingPowerUpSMinus, isPlusOrMinus } from 'sleepapi-common';

export class CookingPowerUpSMinusEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = CookingPowerUpSMinus;
    const invoker = skillState.memberState;
    const potAmount = skillState.skillAmount(skill.activations.solo);
    invoker.cookingState?.addPotSize(potAmount);
    const energyAmount = skillState.skillAmount(skill.activations.paired);
    const paired = invoker.otherMembers.filter((member) => isPlusOrMinus(member.skill)).length === 0;

    const targetedMon = skillState.findTargetMon(skill.targeting);
    let recovered = 0;
    if (paired) {
      recovered += targetedMon.recoverEnergy(energyAmount, invoker).recovered;
    }

    return {
      skill,
      activations: [
        {
          unit: 'pot size',
          self: { regular: potAmount, crit: 0 }
        },
        {
          unit: 'energy',
          team: { regular: recovered, crit: 0 }
        }
      ],
      targeting: skill.targeting
    };
  }
}
