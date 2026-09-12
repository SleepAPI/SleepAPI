import { teamMemberSettingsDto } from '@src/vitest/mocks/index.js';
import type { PokemonWithFinalContribution, PokemonWithRecipeContributions, PokemonWithTiering } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';
import { CookingTierlist } from './cooking-tier-list.js';

describe('tierAndDiff', () => {
  it('assigns F-tier when enough Pokemon to exhaust all tiers', () => {
    const mockPokemonWithSettings: PokemonWithRecipeContributions['pokemonWithSettings'] = {
      pokemon: 'NAME',
      ingredientList: [],
      totalIngredients: Float32Array.prototype,
      critMultiplier: 1,
      averageWeekdayPotSize: 1,
      settings: teamMemberSettingsDto.prototype
    };

    // Create 20 Pokemon with decreasing scores to ensure we exhaust all tier buckets
    const mockContributions: PokemonWithFinalContribution[] = [];
    for (let i = 0; i < 20; i++) {
      mockContributions.push({
        score: 10_000 - i * 400, // Decreasing scores: 10000, 9600, 9200, etc.
        contributions: [],
        pokemonWithSettings: {
          ...mockPokemonWithSettings,
          pokemon: `Pokemon${i}`
        }
      });
    }

    const mockTiering: PokemonWithTiering[] = [];

    const result = CookingTierlist.tierAndDiff(mockContributions, mockTiering);

    // With 20 Pokemon and proper score distribution, the last ones should be F-tier
    const fTierPokemon = result.filter((r) => r.tier === 'F');
    expect(fTierPokemon.length).toBeGreaterThan(0);
  });

  it('correctly calculates tier boundaries with new bucketing algorithm', () => {
    const mockPokemonWithSettings: PokemonWithRecipeContributions['pokemonWithSettings'] = {
      pokemon: 'NAME',
      ingredientList: [],
      totalIngredients: Float32Array.prototype,
      critMultiplier: 1,
      averageWeekdayPotSize: 1,
      settings: teamMemberSettingsDto.prototype
    };

    const mockContributions: PokemonWithFinalContribution[] = [
      { score: 1000, contributions: [], pokemonWithSettings: { ...mockPokemonWithSettings, pokemon: 'High' } },
      { score: 100, contributions: [], pokemonWithSettings: { ...mockPokemonWithSettings, pokemon: 'Low' } }
    ];

    const result = CookingTierlist.tierAndDiff(mockContributions, []);

    expect(result[0].tier).toBe('S'); // Highest score gets S
    expect(result[1].tier).toBe('A'); // With only 2 Pokemon, second gets A (not F)
    expect(result.length).toBe(2);
  });

  it('preserves tier distribution with close scores', () => {
    const mockPokemonWithSettings: PokemonWithRecipeContributions['pokemonWithSettings'] = {
      pokemon: 'NAME',
      ingredientList: [],
      totalIngredients: Float32Array.prototype,
      critMultiplier: 1,
      averageWeekdayPotSize: 1,
      settings: teamMemberSettingsDto.prototype
    };

    // Close scores that should not exhaust all tiers
    const mockContributions: PokemonWithFinalContribution[] = [
      { score: 10_000, contributions: [], pokemonWithSettings: { ...mockPokemonWithSettings, pokemon: 'S' } },
      { score: 9_900, contributions: [], pokemonWithSettings: { ...mockPokemonWithSettings, pokemon: 'A' } },
      { score: 9_800, contributions: [], pokemonWithSettings: { ...mockPokemonWithSettings, pokemon: 'B' } },
      { score: 9_700, contributions: [], pokemonWithSettings: { ...mockPokemonWithSettings, pokemon: 'C' } },
      { score: 9_600, contributions: [], pokemonWithSettings: { ...mockPokemonWithSettings, pokemon: 'D' } },
      { score: 9_500, contributions: [], pokemonWithSettings: { ...mockPokemonWithSettings, pokemon: 'E' } },
      { score: 9_400, contributions: [], pokemonWithSettings: { ...mockPokemonWithSettings, pokemon: 'F' } }
    ];

    const result = CookingTierlist.tierAndDiff(mockContributions, []);

    // With close scores, no F-tier should be assigned
    const fTierPokemon = result.filter((r) => r.tier === 'F');
    expect(fTierPokemon.length).toBe(0);

    // Last Pokemon should be E-tier
    expect(result.at(-1)?.tier).toBe('E');
  });
});
