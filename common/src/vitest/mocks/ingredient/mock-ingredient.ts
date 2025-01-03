import type { Ingredient } from '../../../domain/ingredient/ingredient';

export function mockIngredient(attrs?: Partial<Ingredient>): Ingredient {
  return {
    name: 'Mock ing',
    longName: 'Mocked ingredient',
    value: 0,
    taxedValue: 0,
    ...attrs
  };
}
