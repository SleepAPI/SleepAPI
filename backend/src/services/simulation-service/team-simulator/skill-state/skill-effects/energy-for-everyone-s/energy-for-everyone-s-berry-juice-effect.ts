import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type {
  SkillActivation,
  UnitActivation
} from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { EnergyForEveryoneSBerryJuice } from 'sleepapi-common';

export class EnergyForEveryoneSBerryJuiceEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = EnergyForEveryoneSBerryJuice;
    const invoker = skillState.memberState;
    const energyAmount = skillState.skillAmount(skill.activations.energy);

    let recovered = 0;
    for (const member of [invoker, ...invoker.otherMembers]) {
      recovered += member.recoverEnergy(energyAmount, invoker).recovered;
    }

    const activations: UnitActivation[] = [
      {
        unit: 'energy',
        team: { regular: recovered, crit: 0 }
      }
    ];

    // Add berry juice if roll succeeds
    const rngValue = skillState.rng();
    if (rngValue < skill.juicePercent) {
      activations.push({
        unit: 'items',
        self: { regular: 0, crit: skill.juiceAmount }
      });
    }

    return { skill, activations };
  }
}
