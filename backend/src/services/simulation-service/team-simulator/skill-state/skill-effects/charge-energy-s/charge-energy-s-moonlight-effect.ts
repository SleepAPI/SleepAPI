import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { ChargeEnergySMoonlight } from 'sleepapi-common';

export class ChargeEnergySMoonlightEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const invoker = skillState.memberState;
    const skill = ChargeEnergySMoonlight;
    const selfAmount = skillState.skillAmount(skill.activations.energy);
    const teamAmount = skillState.skillCritAmount(ChargeEnergySMoonlight.activations.energy);

    const isCrit = skillState.rng() < ChargeEnergySMoonlight.critChance;
    const targetedMon = skillState.findTargetMon(skill.targeting);

    const selfRecovered = invoker.recoverEnergy(selfAmount, invoker).recovered;
    const teamRecovered = isCrit ? targetedMon.recoverEnergy(teamAmount, invoker).recovered : 0;

    return {
      skill,
      activations: [
        {
          unit: 'energy',
          self: { regular: selfRecovered, crit: 0 },
          team: { regular: 0, crit: teamRecovered }
        }
      ],
      targeting: skill.targeting
    };
  }
}
