import { SkillCopyEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/skill-copy/skill-copy-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { createPreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import { mocks } from '@src/vitest/index.js';
import type { Mainskill } from 'sleepapi-common';
import { ChargeStrengthS } from 'sleepapi-common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('SkillCopyEffect', () => {
  let skillCopyEffect: SkillCopyEffect;
  let skillState: SkillState;

  beforeEach(() => {
    skillCopyEffect = new SkillCopyEffect();
    skillState = {
      rng: createPreGeneratedRandom(),
      memberState: {
        otherMembers: [
          mocks.memberState({
            skill: {
              isOrModifies: vi.fn().mockReturnValue(false),
              name: 'Test Skill'
            } as unknown as Mainskill
          }),
          {
            pokemonWithIngredients: {
              pokemon: {
                skill: {
                  isOrModifies: vi.fn().mockReturnValue(false),
                  name: 'Test Skill'
                }
              }
            }
          }
        ]
      },
      skillEffects: new Map(),
      skill: {
        name: 'Skill Copy'
      }
    } as unknown as SkillState;

    global.logger = {
      error: vi.fn()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  });

  it('should activate the copied skill', () => {
    const mockActivation = { skill: skillState.skill };
    skillState.skillEffects.set(skillState.memberState.otherMembers[0].skill, {
      activate: vi.fn().mockReturnValue(mockActivation)
    });

    const result = skillCopyEffect.activate(skillState);

    expect(result).toEqual(mockActivation);
    expect(skillState.skillEffects.get(skillState.memberState.otherMembers[0].skill)?.activate).toHaveBeenCalledWith(
      skillState,
      undefined
    );
  });

  it('should fallback to CHARGE_STRENGTH_S if copied skill is same or modified version of SKILL_COPY', () => {
    skillState.memberState.otherMembers[0].skill.isOrModifies = vi.fn().mockReturnValue(true);
    const mockActivation = { skill: skillState.skill };
    skillState.skillEffects.set(ChargeStrengthS, {
      activate: vi.fn().mockReturnValue(mockActivation)
    });

    const result = skillCopyEffect.activate(skillState);

    expect(result).toEqual(mockActivation);
    expect(skillState.skillEffects.get(ChargeStrengthS)?.activate).toHaveBeenCalledWith(skillState, undefined);
  });

  it('should log an error if activation fails', () => {
    skillState.skillEffects.set(skillState.memberState.otherMembers[0].skill, {
      activate: vi.fn().mockReturnValue(null)
    });

    const result = skillCopyEffect.activate(skillState);

    expect(result).toEqual({ skill: skillState.skill, activations: [] });
    expect(logger.error).toHaveBeenCalledWith(`[${skillState.skill.name}] Couldn't activate Charge Strength S`);
  });

  it('should fallback to CHARGE_STRENGTH_S if no skill is copied', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(skillState.memberState.otherMembers[0], 'skill', 'get').mockReturnValue(null as any);
    const mockActivation = { skill: skillState.skill };
    skillState.skillEffects.set(ChargeStrengthS, {
      activate: vi.fn().mockReturnValue(mockActivation)
    });

    const result = skillCopyEffect.activate(skillState);

    expect(result).toEqual(mockActivation);
    expect(skillState.skillEffects.get(ChargeStrengthS)?.activate).toHaveBeenCalledWith(skillState, undefined);
  });
});
