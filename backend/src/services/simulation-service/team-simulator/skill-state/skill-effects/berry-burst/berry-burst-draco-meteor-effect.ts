import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { BerryBurstDracoMeteor, MAX_TEAM_SIZE, uniqueMembersWithBerry } from 'sleepapi-common';

export class BerryBurstDracoMeteorEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const invoker = skillState.memberState;
    const skill = BerryBurstDracoMeteor;

    const pairedWithLatias =
      invoker.otherMembers.find((member) => member.member.pokemonWithIngredients.pokemon.name === 'LATIAS') !==
      undefined;
    const skillActivation = pairedWithLatias ? skill.activations.paired : skill.activations.solo;
    const sameTypeSpeciesCount =
      invoker.team.length > MAX_TEAM_SIZE
        ? 1
        : uniqueMembersWithBerry({
            berry: invoker.berry,
            members: invoker.team.map((member) => member.pokemonWithIngredients.pokemon)
          });

    const selfAmount = skillState.skillAmount(skillActivation, { extra: sameTypeSpeciesCount });
    const teamAmount = skillState.skillTeamAmount(skillActivation, { extra: sameTypeSpeciesCount });

    const berries = invoker.otherMembers.map((member) => ({
      berry: member.berry,
      amount: teamAmount,
      level: member.level
    }));

    berries.push({
      berry: invoker.berry,
      amount: selfAmount,
      level: invoker.level
    });

    invoker.addSkillProduce({ ingredients: [], berries });

    return {
      skill,
      activations: [
        {
          unit: 'berries',
          self: {
            regular: selfAmount + teamAmount * invoker.otherMembers.length,
            crit: 0
          }
        }
      ]
    };
  }
}
