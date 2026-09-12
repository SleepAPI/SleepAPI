import { SolveService } from '@src/services/solve/solve-service.js';
import type { SolveRecipeInput } from '@src/services/solve/types/solution-types.js';
import * as solveUtils from '@src/services/solve/utils/solve-utils.js';
import { mocks } from '@src/vitest/index.js';
import { BerryBurst, commonMocks, type Recipe } from 'sleepapi-common';
import { vimic } from 'vimic';
import { describe, expect, it } from 'vitest';

describe('SolveService', () => {
  it('should return the user team if it solves the recipe alone', () => {
    const ingredientList = [
      commonMocks.mockIngredientSet({ amount: 1, ingredient: commonMocks.mockIngredient({ name: 'ingredient1' }) })
    ];
    const recipe: Recipe = commonMocks.mockRecipe({
      ingredients: ingredientList
    });
    const member = mocks.teamMember({
      pokemonWithIngredients: mocks.pokemonWithIngredients({
        ingredientList,
        pokemon: commonMocks.mockPokemon({ skill: BerryBurst })
      })
    });
    vimic(solveUtils, 'calculateProductionAll', () => ({
      userProduction: [mocks.setCoverPokemonWithSettings()],
      nonSupportProduction: [],
      supportProduction: []
    }));

    const input: SolveRecipeInput = {
      solveSettings: mocks.solveSettings(),
      includedMembers: [member],
      maxTeamSize: 5
    };

    const result = SolveService.solveRecipe(recipe, input);

    expect(result.exhaustive).toBe(true);
    expect(result.teams).toHaveLength(1);
    expect(result.teams[0].members).toHaveLength(1);
    expect(result.teams[0].members[0].pokemonSet.pokemon).toEqual(member.pokemonWithIngredients.pokemon.name);
  });
});
