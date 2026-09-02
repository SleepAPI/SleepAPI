import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import type { Mainskill } from 'sleepapi-common';
import { SkillCopy } from 'sleepapi-common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SkillCopyMimicEffect } from './skill-copy-mimic-effect.js';

describe('SkillCopyMimicEffect', () => {
  let skillState: SkillState;
  let skillEffect: SkillEffect;
  let teamSkillActivation: SkillActivation;

  beforeEach(() => {
    teamSkillActivation = {} as SkillActivation;
    skillEffect = {
      activate: vi.fn().mockReturnValue(teamSkillActivation)
    } as unknown as SkillEffect;

    skillState = {
      skillEffects: new Map<Mainskill, SkillEffect>([[SkillCopy, skillEffect]])
    } as SkillState;
  });

  it('should activate the SKILL_COPY effect', () => {
    const skillCopyMimicEffect = new SkillCopyMimicEffect();
    const result = skillCopyMimicEffect.activate(skillState);

    expect(skillEffect.activate).toHaveBeenCalledWith(skillState, undefined);
    expect(result).toBe(teamSkillActivation);
  });

  it('should throw an error if SKILL_COPY effect is not found', () => {
    skillState.skillEffects.delete(SkillCopy);
    const skillCopyMimicEffect = new SkillCopyMimicEffect();

    expect(() => skillCopyMimicEffect.activate(skillState)).toThrow();
  });
});
