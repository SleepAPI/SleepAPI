import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { ChargeStrengthS, commonMocks, SkillCopy } from 'sleepapi-common';

export class SkillCopyEffect implements SkillEffect {
  activate(skillState: SkillState, recursionDepth?: number): SkillActivation {
    const otherMembers = skillState.memberState.otherMembers;
    const selectedMember = otherMembers.length > 0 ? skillState.rng.randomElement(otherMembers) : undefined;

    let copiedSkill = selectedMember?.skill;

    if (copiedSkill?.isOrModifies(SkillCopy) || !copiedSkill) {
      copiedSkill = ChargeStrengthS;
    }

    const copiedActivation = skillState.skillEffects.get(copiedSkill!)?.activate(skillState, recursionDepth);
    // mockPokemon is used for filling in bogus members in the set cover
    if (!copiedActivation && copiedSkill.name !== commonMocks.mockPokemon().skill.name) {
      logger.error(`[${skillState.skill.name}] Couldn't activate ${copiedSkill?.name}`);
      return { skill: skillState.skill, activations: [] };
    } else if (!copiedActivation) {
      return { skill: copiedSkill, activations: [] };
    }

    return copiedActivation;
  }
}
