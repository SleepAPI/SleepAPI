import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { HelperBoost, MAX_TEAM_SIZE, uniqueMembersWithBerry } from 'sleepapi-common';

export class HelperBoostEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = HelperBoost;
    const invoker = skillState.memberState;
    const unique =
      invoker.team.length > MAX_TEAM_SIZE // accounts for bogus members
        ? 1
        : uniqueMembersWithBerry({
            berry: invoker.berry,
            members: invoker.team.map((member) => member.pokemonWithIngredients.pokemon)
          });

    const helps = skillState.skillAmount(HelperBoost.activations.helps, { extra: unique });
    for (const member of [invoker, ...invoker.otherMembers]) {
      member.addHelpsFromSkill(helps, invoker);
    }

    return {
      skill,
      activations: [
        {
          unit: 'helps',
          team: { regular: helps * invoker.teamSize, crit: 0 }
        }
      ]
    };
  }
}
