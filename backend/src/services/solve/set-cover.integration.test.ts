import { mocks } from '@src/bun/index.js';
import { SetCover } from '@src/services/solve/set-cover.js';
import type {
  ProducersByIngredientIndex,
  SetCoverPokemonSetup
} from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import { describe, expect, it } from 'bun:test';
import { ingredient, ingredientSetToIntFlat } from 'sleepapi-common';

describe('Set Cover Integration', () => {
  it('should purge sub-optimal solutions when smaller team is found', () => {
    const producersByIngredientIndex = Array.from({ length: ingredient.TOTAL_NUMBER_OF_INGREDIENTS }, () => []);
    setupGreengrassProducers(producersByIngredientIndex);

    const cachedSubRecipeSolves = new Map();
    const setCover = new SetCover(producersByIngredientIndex, cachedSubRecipeSolves);

    const maxTeamSize = 5;
    const mockedGreengrassSalad = [
      // Recipe: 22 Oil, 17 Corn, 14 Tomato, 9 Potato
      mocks.mockIngredientSet({ amount: 22, ingredient: ingredient.PURE_OIL }),
      mocks.mockIngredientSet({ amount: 17, ingredient: ingredient.GREENGRASS_CORN }),
      mocks.mockIngredientSet({ amount: 14, ingredient: ingredient.SNOOZY_TOMATO }),
      mocks.mockIngredientSet({ amount: 9, ingredient: ingredient.SOFT_POTATO })
    ];
    const recipe = ingredientSetToIntFlat(mockedGreengrassSalad);

    const solutions = setCover.solveRecipe(recipe, maxTeamSize);

    expect(solutions.exhaustive).toBe(true);
    const teams = solutions.teams.map((team) => team.members.map((member) => member.pokemonSet.pokemon));
    logger.error(teams);
    // expect(teams).toHaveLength(10);
    const firstTeam = solutions.teams[0];

    expect(firstTeam.members).toHaveLength(3); // team requires three members
  });
});

function setupGreengrassProducers(producersByIngredientIndex: ProducersByIngredientIndex) {
  // [
  //   "DRAGONITE 32 Oil, 28 Herb",
  //   "DRAGONITE 32 Oil, 8 Herb, 16 Corn",
  //   "CRAMORANT 29 Oil",
  //   "CRAMORANT 19 Oil, 8 Potato",
  //   "CRAMORANT 15 Oil, 15 Potato",
  //   "CRAMORANT 17 Egg, 15 Oil",
  //   "CRAMORANT 4 Oil, 23 Potato",
  //   "CRAMORANT 17 Egg, 4 Oil, 8 Potato"
  // ]
  // OIL - index 8
  const dragoniteAAC: SetCoverPokemonSetup = mocks.setCoverPokemonSetup({
    pokemonSet: {
      pokemon: 'DRAGONITE',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      mocks.mockIngredientSet({ amount: 32, ingredient: ingredient.PURE_OIL }),
      mocks.mockIngredientSet({ amount: 28, ingredient: ingredient.FIERY_HERB })
    ])
  });
  const dragoniteABC: SetCoverPokemonSetup = mocks.setCoverPokemonSetup({
    pokemonSet: {
      pokemon: 'DRAGONITE',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      mocks.mockIngredientSet({ amount: 8, ingredient: ingredient.FIERY_HERB }),
      mocks.mockIngredientSet({ amount: 16, ingredient: ingredient.GREENGRASS_CORN }),
      mocks.mockIngredientSet({ amount: 32, ingredient: ingredient.PURE_OIL })
    ])
  });
  const cramorantAAA: SetCoverPokemonSetup = mocks.setCoverPokemonSetup({
    pokemonSet: {
      pokemon: 'CRAMORANT',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([mocks.mockIngredientSet({ amount: 29, ingredient: ingredient.PURE_OIL })])
  });
  const cramorantABA: SetCoverPokemonSetup = mocks.setCoverPokemonSetup({
    pokemonSet: {
      pokemon: 'CRAMORANT',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      mocks.mockIngredientSet({ amount: 19, ingredient: ingredient.PURE_OIL }),
      mocks.mockIngredientSet({ amount: 8, ingredient: ingredient.SOFT_POTATO })
    ])
  });
  const cramorantAAB: SetCoverPokemonSetup = mocks.setCoverPokemonSetup({
    pokemonSet: {
      pokemon: 'CRAMORANT',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      mocks.mockIngredientSet({ amount: 15, ingredient: ingredient.PURE_OIL }),
      mocks.mockIngredientSet({ amount: 15, ingredient: ingredient.SOFT_POTATO })
    ])
  });
  const cramorantAAC: SetCoverPokemonSetup = mocks.setCoverPokemonSetup({
    pokemonSet: {
      pokemon: 'CRAMORANT',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      mocks.mockIngredientSet({ amount: 17, ingredient: ingredient.FANCY_EGG }),
      mocks.mockIngredientSet({ amount: 15, ingredient: ingredient.PURE_OIL })
    ])
  });
  const cramorantABB: SetCoverPokemonSetup = mocks.setCoverPokemonSetup({
    pokemonSet: {
      pokemon: 'CRAMORANT',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      mocks.mockIngredientSet({ amount: 4, ingredient: ingredient.PURE_OIL }),
      mocks.mockIngredientSet({ amount: 23, ingredient: ingredient.SOFT_POTATO })
    ])
  });
  const cramorantABC: SetCoverPokemonSetup = mocks.setCoverPokemonSetup({
    pokemonSet: {
      pokemon: 'CRAMORANT',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      mocks.mockIngredientSet({ amount: 17, ingredient: ingredient.FANCY_EGG }),
      mocks.mockIngredientSet({ amount: 4, ingredient: ingredient.PURE_OIL }),
      mocks.mockIngredientSet({ amount: 8, ingredient: ingredient.SOFT_POTATO })
    ])
  });

  producersByIngredientIndex[8].push(dragoniteAAC);
  producersByIngredientIndex[8].push(dragoniteABC);
  producersByIngredientIndex[8].push(cramorantAAA);
  producersByIngredientIndex[8].push(cramorantABA);
  producersByIngredientIndex[8].push(cramorantAAB);
  producersByIngredientIndex[8].push(cramorantAAC);
  producersByIngredientIndex[8].push(cramorantABB);
  producersByIngredientIndex[8].push(cramorantABC);

  // [
  //   "DRAGONITE 8 Herb, 44 Corn",
  //   "DRAGONITE 28 Herb, 28 Corn",
  //   "DRAGONITE 36 Herb, 16 Corn",
  //   "DRAGONITE 32 Oil, 8 Herb, 16 Corn"
  // ]
  // CORN - index 11
  const dragoniteABB: SetCoverPokemonSetup = mocks.setCoverPokemonSetup({
    pokemonSet: {
      pokemon: 'DRAGONITE',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      mocks.mockIngredientSet({ amount: 8, ingredient: ingredient.FIERY_HERB }),
      mocks.mockIngredientSet({ amount: 44, ingredient: ingredient.GREENGRASS_CORN })
    ])
  });
  const dragoniteAAB: SetCoverPokemonSetup = mocks.setCoverPokemonSetup({
    pokemonSet: {
      pokemon: 'DRAGONITE',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      mocks.mockIngredientSet({ amount: 28, ingredient: ingredient.FIERY_HERB }),
      mocks.mockIngredientSet({ amount: 28, ingredient: ingredient.GREENGRASS_CORN })
    ])
  });
  const dragoniteABA: SetCoverPokemonSetup = mocks.setCoverPokemonSetup({
    pokemonSet: {
      pokemon: 'DRAGONITE',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      mocks.mockIngredientSet({ amount: 36, ingredient: ingredient.FIERY_HERB }),
      mocks.mockIngredientSet({ amount: 16, ingredient: ingredient.GREENGRASS_CORN })
    ])
  });
  producersByIngredientIndex[11].push(dragoniteABB);
  producersByIngredientIndex[11].push(dragoniteAAB);
  producersByIngredientIndex[11].push(dragoniteABA);
  producersByIngredientIndex[11].push(dragoniteABC);

  // [
  //   "VICTREEBEL 47 Tomato",
  //   "VICTREEBEL 30 Tomato, 13 Potato",
  //   "VICTREEBEL 23 Tomato, 20 Potato",
  //   "VICTREEBEL 23 Tomato, 13 Leek",
  //   "VICTREEBEL 7 Tomato, 34 Potato",
  //   "VICTREEBEL 7 Tomato, 13 Potato, 13 Leek"
  // ]
  // TOMATO - index 6
  const victreebelAAA: SetCoverPokemonSetup = mocks.setCoverPokemonSetup({
    pokemonSet: {
      pokemon: 'VICTREEBEL',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      mocks.mockIngredientSet({ amount: 47, ingredient: ingredient.SNOOZY_TOMATO })
    ])
  });
  const victreebelABA: SetCoverPokemonSetup = mocks.setCoverPokemonSetup({
    pokemonSet: {
      pokemon: 'VICTREEBEL',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      mocks.mockIngredientSet({ amount: 30, ingredient: ingredient.SNOOZY_TOMATO }),
      mocks.mockIngredientSet({ amount: 13, ingredient: ingredient.SOFT_POTATO })
    ])
  });
  const victreebelAAB: SetCoverPokemonSetup = mocks.setCoverPokemonSetup({
    pokemonSet: {
      pokemon: 'VICTREEBEL',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      mocks.mockIngredientSet({ amount: 23, ingredient: ingredient.SNOOZY_TOMATO }),
      mocks.mockIngredientSet({ amount: 20, ingredient: ingredient.SOFT_POTATO })
    ])
  });
  const victreebelAAC: SetCoverPokemonSetup = mocks.setCoverPokemonSetup({
    pokemonSet: {
      pokemon: 'VICTREEBEL',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      mocks.mockIngredientSet({ amount: 23, ingredient: ingredient.SNOOZY_TOMATO }),
      mocks.mockIngredientSet({ amount: 13, ingredient: ingredient.LARGE_LEEK })
    ])
  });
  const victreebelABB: SetCoverPokemonSetup = mocks.setCoverPokemonSetup({
    pokemonSet: {
      pokemon: 'VICTREEBEL',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      mocks.mockIngredientSet({ amount: 7, ingredient: ingredient.SNOOZY_TOMATO }),
      mocks.mockIngredientSet({ amount: 33, ingredient: ingredient.SOFT_POTATO })
    ])
  });
  const victreebelABC: SetCoverPokemonSetup = mocks.setCoverPokemonSetup({
    pokemonSet: {
      pokemon: 'VICTREEBEL',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      mocks.mockIngredientSet({ amount: 7, ingredient: ingredient.SNOOZY_TOMATO }),
      mocks.mockIngredientSet({ amount: 13, ingredient: ingredient.SOFT_POTATO }),
      mocks.mockIngredientSet({ amount: 13, ingredient: ingredient.LARGE_LEEK })
    ])
  });

  producersByIngredientIndex[6].push(victreebelAAA);
  producersByIngredientIndex[6].push(victreebelABA);
  producersByIngredientIndex[6].push(victreebelAAB);
  producersByIngredientIndex[6].push(victreebelAAC);
  producersByIngredientIndex[6].push(victreebelABB);
  producersByIngredientIndex[6].push(victreebelABC);

  // [
  //   "VICTREEBEL 7 Tomato, 34 Potato",
  //   "CRAMORANT 4 Oil, 23 Potato",
  //   "VICTREEBEL 23 Tomato, 20 Potato",
  //   "CRAMORANT 15 Oil, 15 Potato",
  //   "VICTREEBEL 30 Tomato, 13 Potato",
  //   "VICTREEBEL 7 Tomato, 13 Potato, 13 Leek",
  //   "CRAMORANT 19 Oil, 8 Potato",
  //   "CRAMORANT 17 Egg, 4 Oil, 8 Potato"
  // ]
  // SOFT_POTATO - index 9

  producersByIngredientIndex[9].push(victreebelABB);
  producersByIngredientIndex[9].push(cramorantABB);
  producersByIngredientIndex[9].push(victreebelAAB);
  producersByIngredientIndex[9].push(cramorantAAB);
  producersByIngredientIndex[9].push(victreebelABA);
  producersByIngredientIndex[9].push(victreebelABC);
  producersByIngredientIndex[9].push(cramorantABA);
  producersByIngredientIndex[9].push(cramorantABC);
}
