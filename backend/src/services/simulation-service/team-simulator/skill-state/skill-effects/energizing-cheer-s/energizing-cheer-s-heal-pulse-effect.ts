import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { EnergizingCheerSHealPulse } from 'sleepapi-common';

export class EnergizingCheerSHealPulseEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = EnergizingCheerSHealPulse;
    const invoker = skillState.memberState;
    const energyAmount = skillState.skillAmount(skill.activations.energy);
    const baseHelpsAmount = skillState.skillAmount(skill.activations.soloHelps);
    const bonusHelpsAmount = skillState.skillAmount(skill.activations.pairedHelps);

    const pairedWithLatios =
      invoker.otherMembers.find((member) => member.member.pokemonWithIngredients.pokemon.name === 'LATIOS') !==
      undefined;
    const combinedHelpsAmount = baseHelpsAmount + (pairedWithLatios ? bonusHelpsAmount : 0);

    const targetedMons = skillState.findTargetGroup(skill.targeting);
    let recovered = 0;
    let helps = 0;
    for (const member of targetedMons) {
      recovered += member.recoverEnergy(energyAmount, invoker).recovered;
      member.addHelpsFromSkill(combinedHelpsAmount, invoker);
      helps += combinedHelpsAmount;
    }

    return {
      skill,
      activations: [
        {
          unit: 'energy',
          team: { regular: recovered, crit: 0 }
        },
        {
          unit: 'helps',
          team: { regular: helps, crit: 0 }
        }
      ],
      targeting: EnergizingCheerSHealPulse.targeting
    };
  }
}
