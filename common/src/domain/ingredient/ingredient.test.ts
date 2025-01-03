import { describe, expect, it } from 'vitest';
import type { Ingredient } from './ingredient';
import * as IngredientsModule from './ingredients';

describe('INGREDIENTS array', () => {
  it('should include all dynamically defined ingredients in the INGREDIENTS array', () => {
    // Dynamically extract all constants that are Ingredient objects
    const allIngredients = Object.values(IngredientsModule).filter(
      (value): value is Ingredient =>
        typeof value === 'object' &&
        value !== null &&
        'name' in value &&
        'value' in value &&
        'identifier' in value &&
        'taxedValue' in value &&
        'longName' in value
    );

    allIngredients.forEach((ingredient) => {
      expect(IngredientsModule.INGREDIENTS).toContainEqual(ingredient);
    });
  });
});
