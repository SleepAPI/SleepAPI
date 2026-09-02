import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { ChargeStrengthMBadDreamsEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-strength-m/charge-strength-m-bad-dreams-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { berry, ChargeStrengthMBadDreams } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('ChargeStrengthMBadDreamsEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let chargeStrengthMBadDreamsEffect: ChargeStrengthMBadDreamsEffect;
  let mockOtherMembers: MemberState[];

  beforeEach(() => {
    memberState = mocks.memberState();
    skillState = mocks.skillState(memberState);
    chargeStrengthMBadDreamsEffect = new ChargeStrengthMBadDreamsEffect();

    // Create mock other members
    mockOtherMembers = [mocks.memberState(), mocks.memberState()];

    Object.defineProperty(skillState.memberState, 'otherMembers', {
      get: () => mockOtherMembers
    });
  });

  it('should activate skill and return correct self values', () => {
    const regularAmount = 30;
    vimic(skillState, 'skillAmount', () => regularAmount);

    mockOtherMembers.forEach((member) => {
      Object.defineProperty(member, 'berry', {
        get: () => ({ name: 'Not Wiki Berry' })
      });

      vimic(member, 'degradeEnergy', () => 10);
    });

    const activation = chargeStrengthMBadDreamsEffect.activate(skillState);

    expect(activation.skill).toBe(ChargeStrengthMBadDreams);
    expect(activation.activations[0].unit).toBe('strength');
    expect(activation.activations[0].self?.regular).toBe(regularAmount);
    expect(activation.activations[0].self?.crit).toBe(0);

    // Verify degradeEnergy was called for each other member
    mockOtherMembers.forEach((member) => {
      expect(member.degradeEnergy).toHaveBeenCalledWith(ChargeStrengthMBadDreams.energyReduction);
    });
  });

  it('should not degrade energy for members with Wiki berries', () => {
    const regularAmount = 30;
    vimic(skillState, 'skillAmount', () => regularAmount);

    // Set one member to have a Wiki berry, one with a different berry
    Object.defineProperty(mockOtherMembers[0], 'berry', {
      get: () => ({ name: berry.WIKI.name })
    });
    Object.defineProperty(mockOtherMembers[1], 'berry', {
      get: () => ({ name: 'Not Wiki Berry' })
    });

    // Mock the degradeEnergy method
    vimic(mockOtherMembers[0], 'degradeEnergy', () => 0);
    vimic(mockOtherMembers[1], 'degradeEnergy', () => 10);

    chargeStrengthMBadDreamsEffect.activate(skillState);

    // The member with Wiki berry should not have energy degraded
    expect(mockOtherMembers[0].degradeEnergy).not.toHaveBeenCalled();
    expect(mockOtherMembers[1].degradeEnergy).toHaveBeenCalledWith(ChargeStrengthMBadDreams.energyReduction);
  });

  it('should handle a team with only Wiki berry members', () => {
    const regularAmount = 30;
    vimic(skillState, 'skillAmount', () => regularAmount);

    // Set all members to have Wiki berries
    mockOtherMembers.forEach((member) => {
      Object.defineProperty(member, 'berry', {
        get: () => ({ name: berry.WIKI.name })
      });

      // Mock the degradeEnergy method so we can check it's not called
      vimic(member, 'degradeEnergy', () => 0);
    });

    chargeStrengthMBadDreamsEffect.activate(skillState);

    // No members should have energy degraded
    mockOtherMembers.forEach((member) => {
      expect(member.degradeEnergy).not.toHaveBeenCalled();
    });
  });
});
