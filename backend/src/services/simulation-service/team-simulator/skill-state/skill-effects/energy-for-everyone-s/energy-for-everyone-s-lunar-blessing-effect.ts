import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { EnergyForEveryoneSLunarBlessing, MAX_TEAM_SIZE, uniqueMembersWithBerry } from 'sleepapi-common';

export class EnergyForEveryoneSLunarBlessingEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = EnergyForEveryoneSLunarBlessing;
    const invoker = skillState.memberState;
    const unique =
      invoker.team.length > MAX_TEAM_SIZE // accounts for bogus members
        ? 1
        : uniqueMembersWithBerry({
            berry: invoker.berry,
            members: invoker.team.map((member) => member.pokemonWithIngredients.pokemon)
          });

    const energyAmount = skillState.skillAmount(skill.activations.energy);
    const selfBerryAmount = skillState.skillAmount(EnergyForEveryoneSLunarBlessing.activations.selfBerries, {
      extra: unique
    });
    const teamBerryAmount = skillState.skillAmount(EnergyForEveryoneSLunarBlessing.activations.teamBerries, {
      extra: unique
    });

    let recovered = 0;
    for (const member of [invoker, ...invoker.otherMembers]) {
      recovered += member.recoverEnergy(energyAmount, invoker).recovered;
    }

    const berries = invoker.otherMembers.map((member) => ({
      berry: member.berry,
      amount: teamBerryAmount,
      level: member.level
    }));

    berries.push({
      berry: invoker.berry,
      amount: selfBerryAmount,
      level: invoker.level
    });

    invoker.addSkillProduce({ ingredients: [], berries });

    return {
      skill,
      activations: [
        {
          unit: 'berries',
          self: { regular: selfBerryAmount + teamBerryAmount * invoker.otherMembers.length, crit: 0 }
        },
        {
          unit: 'energy',
          team: { regular: recovered, crit: 0 }
        }
      ]
    };
  }
}
