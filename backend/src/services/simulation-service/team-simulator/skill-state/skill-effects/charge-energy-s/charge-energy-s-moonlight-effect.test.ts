/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChargeEnergySMoonlightEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-energy-s/charge-energy-s-moonlight-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { ChargeEnergySMoonlight } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('ChargeEnergySMoonlightEffect', () => {
  let skillState: SkillState;
  let effect: ChargeEnergySMoonlightEffect;

  beforeEach(() => {
    skillState = mocks.skillState(mocks.memberState());
    effect = new ChargeEnergySMoonlightEffect();
  });

  it('should activate skill and recover energy', () => {
    // always fail
    vimic(skillState, 'rng', () => 1);

    const activation = effect.activate(skillState);
    const skill = ChargeEnergySMoonlight;
    const selfAmount = skillState.skillAmount(skill.activations.energy);

    expect((skillState.memberState as any).currentEnergy).toBe(selfAmount);
    expect((skillState.memberState as any).totalRecovery).toBe(selfAmount);
    expect(activation.skill).toBe(skill);
    expect(activation.activations.length).toBe(1);
    expect(activation.activations[0].unit).toBe('energy');
    expect(activation.activations[0].self?.regular).toBe(selfAmount);
    expect(activation.activations[0].self?.crit).toBe(0);
  });

  it('should activate skill with critical hit', () => {
    // always crit
    vimic(skillState, 'rng', () => 0);

    const activation = effect.activate(skillState);
    const skill = ChargeEnergySMoonlight;
    const selfAmount = skillState.skillAmount(skill.activations.energy);
    const teamAmount = ChargeEnergySMoonlight.critAmounts[skillState.skillLevel - 1];

    expect(activation.skill).toBe(skill);
    expect(activation.activations.length).toBe(1);
    expect(activation.activations[0].unit).toBe('energy');
    expect(activation.activations[0].self?.regular).toBe(selfAmount);
    expect(activation.activations[0].self?.crit).toBe(0);
    expect(activation.activations[0].team?.regular).toBe(0);
    expect(activation.activations[0].team?.crit).toBe(teamAmount);
    expect(activation.targeting?.chanceToTargetLowestMembers).toBe(skill.targeting.chanceToTargetLowestMembers);
  });
});
