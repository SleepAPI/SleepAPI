import { describe, expect, it } from 'vitest';
import { COMPLETE_POKEDEX } from '../../domain/pokemon';

describe('pokedex', () => {
  it('shall have 0 or 1 total gender ratios', () => {
    COMPLETE_POKEDEX.forEach((species) => {
      expect(species.genders.male + species.genders.female).toSatisfy((x) => x == 0 || x == 1);
    });
  });
});
