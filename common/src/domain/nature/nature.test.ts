import { describe, expect, it } from 'vitest';
import { NATURES, NatureModifier } from '../../domain/nature/nature';

describe('Nature Modifiers', () => {
  it('should verify that the positiveModifier matches the stat > 1 and negativeModifier matches stat < 1', () => {
    NATURES.forEach((nature) => {
      const statValues: { [key in NatureModifier]: number } = {
        speed: nature.frequency,
        ingredient: nature.ingredient,
        skill: nature.skill,
        energy: nature.energy,
        exp: nature.exp,
        neutral: 1, // Neutral is always 1 for all stats
      };

      const positiveStat = statValues[nature.positiveModifier];
      const negativeStat = statValues[nature.negativeModifier];

      if (nature.positiveModifier !== 'neutral') {
        expect(positiveStat).toBeGreaterThan(1);
      }

      if (nature.negativeModifier !== 'neutral') {
        expect(negativeStat).toBeLessThan(1);
      }

      // For neutral modifiers, all stats should be exactly 1
      if (nature.positiveModifier === 'neutral' && nature.negativeModifier === 'neutral') {
        Object.values(statValues).forEach((stat) => {
          expect(stat).toBe(1);
        });
      }
    });
  });
});
