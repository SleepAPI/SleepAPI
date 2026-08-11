import { describe, expect, it } from 'vitest';
import pokemonNames from '../../locales/en/pokemonNames';
import { COMPLETE_POKEDEX } from './pokedex';
import type { Pokemon } from './pokemon';

describe('remainingEvolutions', () => {
  it('shall never be negative', () => {
    COMPLETE_POKEDEX.forEach((pokemon: Pokemon) => {
      expect(pokemon.remainingEvolutions).toBeGreaterThanOrEqual(0);
    });
  });

  it('shall not exceed 2', () => {
    COMPLETE_POKEDEX.forEach((pokemon: Pokemon) => {
      expect(pokemon.remainingEvolutions).toBeLessThanOrEqual(2);
    });
  });
});

describe('previousEvolutions', () => {
  it('shall never be negative', () => {
    COMPLETE_POKEDEX.forEach((pokemon: Pokemon) => {
      expect(pokemon.previousEvolutions).toBeGreaterThanOrEqual(0);
    });
  });

  it('shall not exceed 2', () => {
    COMPLETE_POKEDEX.forEach((pokemon: Pokemon) => {
      expect(pokemon.previousEvolutions).toBeLessThanOrEqual(2);
    });
  });
});

describe('COMPLETE_POKEDEX', () => {
  COMPLETE_POKEDEX.forEach((pokemon: Pokemon) => {
    it(`shall not change ${pokemon.name} unexpectedly`, () => {
      expect(pokemon).toMatchSnapshot();
    });

    it(`shall include matching evolution references for ${pokemon.name}`, () => {
      if (pokemon.evolvesFrom !== undefined) {
        const previousForm = COMPLETE_POKEDEX.find((mon: Pokemon) => mon.name === pokemon.evolvesFrom);
        expect(previousForm?.evolvesInto).toContain(pokemon.name);
      }
      pokemon.evolvesInto.forEach((evolvedFormName: string) => {
        const evolvedForm = COMPLETE_POKEDEX.find((mon: Pokemon) => mon.name === evolvedFormName);
        expect(evolvedForm?.evolvesFrom).toBe(pokemon.name);
      });
    });
  });

  COMPLETE_POKEDEX.forEach((pokemon: Pokemon) => {
    it(`shall define a display name for ${pokemon.name}`, () => {
      expect(pokemon.displayName).toBeDefined();
    });
  });

  COMPLETE_POKEDEX.forEach((pokemon: Pokemon) => {
    it(`shall include a localized name entry for ${pokemon.name}`, () => {
      expect(Object.prototype.hasOwnProperty.call(pokemonNames, pokemon.name)).toBe(true);
      expect(pokemonNames[pokemon.name as keyof typeof pokemonNames]).toBeDefined();
    });
  });
});
