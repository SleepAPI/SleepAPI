import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { berry, ChargeStrengthMBadDreams } from 'sleepapi-common';

export class ChargeStrengthMBadDreamsEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = ChargeStrengthMBadDreams;

    let energyDegraded = 0;
    const nonDarkTeamMembers = skillState.memberState.otherMembers.filter(
      (member) => member.berry.name !== berry.WIKI.name
    );
    for (const otherMember of nonDarkTeamMembers) {
      energyDegraded += otherMember.degradeEnergy(ChargeStrengthMBadDreams.energyReduction);
    }

    return {
      skill,
      activations: [
        {
          unit: 'strength',
          self: { regular: skillState.skillAmount(skill.activations.strength), crit: 0 }
        },
        {
          unit: 'energy',
          team: { regular: -energyDegraded, crit: 0 }
        }
      ]
    };
  }
}
