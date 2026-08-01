import { ChargeStrengthSStockpileEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-strength-s/charge-strength-s-stockpile-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { ChargeStrengthSStockpile, commonMocks } from 'sleepapi-common';
import { vimic } from 'vimic';

describe('ChargeStrengthSStockpileSEffect', () => {
  let effect: ChargeStrengthSStockpileEffect;
  let mockSkillState: SkillState;

  beforeEach(() => {
    effect = new ChargeStrengthSStockpileEffect();
    mockSkillState = mocks.skillState(
      mocks.memberState({
        member: mocks.teamMember({
          pokemonWithIngredients: mocks.pokemonWithIngredients({
            pokemon: commonMocks.mockPokemon({ skill: ChargeStrengthSStockpile })
          })
        })
      })
    );
  });

  it('should initialize currentStockpile to 0', () => {
    expect(effect['currentStockpile']).toBe(0);
  });

  it('should return correct activation when crit chance is triggered', () => {
    vimic(mockSkillState, 'rng', () => 0.01); // Return a value below the crit chance

    const result = effect.activate(mockSkillState);

    expect(result).toEqual({
      skill: ChargeStrengthSStockpile,
      activations: [
        {
          unit: 'strength',
          self: { regular: ChargeStrengthSStockpile.spitUpAmounts[1][0], crit: 0 }
        }
      ]
    });
    expect(effect['currentStockpile']).toBe(0);
  });

  it('should guarantee spit at max stocks', () => {
    const maxStockCount = ChargeStrengthSStockpile.spitUpAmounts[1].length - 1;
    effect['currentStockpile'] = maxStockCount;
    vimic(mockSkillState, 'rng', () => 0.99); // Return a value above the crit chance

    const result = effect.activate(mockSkillState);

    expect(result).toEqual({
      skill: ChargeStrengthSStockpile,
      activations: [
        {
          unit: 'strength',
          self: { regular: ChargeStrengthSStockpile.spitUpAmounts[1][maxStockCount], crit: 0 }
        }
      ]
    });
    expect(effect['currentStockpile']).toBe(0);
  });

  it('should increment currentStockpile when not full and crit chance is not triggered', () => {
    effect['currentStockpile'] = 0;
    vimic(mockSkillState, 'rng', () => 0.99); // Return a value above the crit chance

    effect.activate(mockSkillState);

    expect(effect['currentStockpile']).toBe(1);
  });

  it('should reset currentStockpile when crit chance is triggered', () => {
    effect['currentStockpile'] = 2;
    vimic(mockSkillState, 'rng', () => 0.01); // Return a value below the crit chance

    expect(effect['currentStockpile']).toBe(2);
    effect.activate(mockSkillState);

    expect(effect['currentStockpile']).toBe(0);
  });
});
