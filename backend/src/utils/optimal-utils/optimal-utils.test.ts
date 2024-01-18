import { PokemonCombination, PokemonCombinationContributions } from '../../domain/combination/combination';
import { CustomPokemonCombinationWithProduce } from '../../domain/combination/custom';
import { Contribution } from '../../domain/computed/contribution';
import { PINSIR } from '../../domain/pokemon/ingredient-pokemon';
import { LEPPA } from '../../domain/produce/berry';
import { FANCY_APPLE, HONEY } from '../../domain/produce/ingredient';
import { DREAM_EATER_BUTTER_CURRY, SPORE_MUSHROOM_CURRY } from '../../domain/recipe/curry';
import { JIGGLYPUFFS_FRUITY_FLAN } from '../../domain/recipe/dessert';
import { MealType } from '../../domain/recipe/meal';
import { NINJA_SALAD } from '../../domain/recipe/salad';
import { RASH } from '../../domain/stat/nature';
import {
  calculateCombinedContributions,
  calculateOptimalFlexibleScore,
  hashPokemonCombination,
  removeDuplicatePokemonCombinations,
  selectBestContributionsWithMultiplier,
} from './optimal-utils';

describe('calculateCombinedContributions', () => {
  it('correctly processes and maps contributions', () => {
    const pokemonCombinationContributions: PokemonCombinationContributions = {
      pokemonCombination: {
        pokemon: PINSIR,
        ingredientList: [{ amount: 2, ingredient: HONEY }],
      },
      contributions: [
        {
          contributedPower: 100,
          meal: JIGGLYPUFFS_FRUITY_FLAN,
          percentage: 100,
        },
      ],
    };

    const result = calculateCombinedContributions([pokemonCombinationContributions]);
    expect(result).toHaveLength(1);
    expect(result[0].scoreResult.score).toBe(120);
    expect(result[0].scoreResult.countedMeals.map((meal) => meal.meal.name)).toEqual([JIGGLYPUFFS_FRUITY_FLAN.name]);
    expect(result[0].scoreResult.contributions.map((meal) => meal.meal.name)).toEqual([JIGGLYPUFFS_FRUITY_FLAN.name]);
  });
});

describe('calculateOptimalFlexibleScore', () => {
  it('calculates the optimal score with multipliers and additional recipes', () => {
    const BEST_RECIPE_PER_TYPE_MULTIPLIER = 1.2;

    const contribution1: Contribution = {
      contributedPower: 100,
      meal: DREAM_EATER_BUTTER_CURRY,
      percentage: 100,
    };
    const contribution2: Contribution = {
      contributedPower: 10,
      meal: SPORE_MUSHROOM_CURRY,
      percentage: 100,
    };
    const contribution3: Contribution = {
      contributedPower: 50,
      meal: JIGGLYPUFFS_FRUITY_FLAN,
      percentage: 100,
    };

    const contributions = [contribution1, contribution2, contribution3];
    const result = calculateOptimalFlexibleScore(contributions);

    // Best contribution from curry (with multiplier)
    const expectedBestCurry = {
      ...contribution1,
      contributedPower: contribution1.contributedPower * BEST_RECIPE_PER_TYPE_MULTIPLIER,
    };

    // Best contribution from dessert (with multiplier)
    const expectedBestDessert = {
      ...contribution3,
      contributedPower: contribution3.contributedPower * BEST_RECIPE_PER_TYPE_MULTIPLIER,
    };

    // Expect these best contributions to be in the result
    expect(result.countedMeals).toContainEqual(expectedBestCurry);
    expect(result.countedMeals).toContainEqual(expectedBestDessert);

    // The next best contribution after the best ones (no multiplier)
    const nextBestContributions = [contribution2];

    // Verify if the next best contributions are included
    nextBestContributions.forEach((contribution) => {
      expect(result.countedMeals).toContainEqual(contribution);
    });

    // Verify the total score
    const expectedTotalScore = [expectedBestCurry, expectedBestDessert, ...nextBestContributions].reduce(
      (sum, contribution) => sum + contribution.contributedPower,
      0
    );
    expect(result.score).toBe(expectedTotalScore);

    // Check if contributions are sorted by contributedPower in descending order
    expect(result.contributions).toEqual(contributions.sort((a, b) => b.contributedPower - a.contributedPower));
  });
});

describe('selectBestContributionsWithMultiplier', () => {
  it('shall select the best contribution from each type and apply the multiplier', () => {
    const multiplier = 1.5;

    const curryContribution: Contribution = {
      contributedPower: 10,
      meal: DREAM_EATER_BUTTER_CURRY,
      percentage: 100,
    };

    const saladContribution: Contribution = {
      contributedPower: 15,
      meal: NINJA_SALAD,
      percentage: 100,
    };

    const dessertContribution: Contribution = {
      contributedPower: 20,
      meal: JIGGLYPUFFS_FRUITY_FLAN,
      percentage: 100,
    };

    const contributionsByType: Record<MealType, Contribution[]> = {
      curry: [curryContribution],
      salad: [saladContribution],
      dessert: [dessertContribution],
    };

    const expectedBestCurry = {
      ...curryContribution,
      contributedPower: curryContribution.contributedPower * multiplier,
    };
    const expectedBestSalad = {
      ...saladContribution,
      contributedPower: saladContribution.contributedPower * multiplier,
    };
    const expectedBestDessert = {
      ...dessertContribution,
      contributedPower: dessertContribution.contributedPower * multiplier,
    };

    const result = selectBestContributionsWithMultiplier(contributionsByType, multiplier);

    expect(result).toContainEqual(expectedBestCurry);
    expect(result).toContainEqual(expectedBestSalad);
    expect(result).toContainEqual(expectedBestDessert);
    expect(result.length).toBe(3);
  });

  it('shall only select the best recipe per type', () => {
    const multiplier = 1.5;

    const curryContribution1: Contribution = {
      contributedPower: 10,
      meal: SPORE_MUSHROOM_CURRY,
      percentage: 100,
    };
    const curryContribution2: Contribution = {
      contributedPower: 20,
      meal: DREAM_EATER_BUTTER_CURRY,
      percentage: 100,
    };
    const saladContribution: Contribution = {
      contributedPower: 15,
      meal: NINJA_SALAD,
      percentage: 100,
    };

    const contributionsByType: Record<MealType, Contribution[]> = {
      curry: [curryContribution1, curryContribution2],
      salad: [saladContribution],
      dessert: [],
    };

    const expectedBestCurry = {
      ...curryContribution2,
      contributedPower: curryContribution2.contributedPower * multiplier,
    };
    const expectedBestSalad = {
      ...saladContribution,
      contributedPower: saladContribution.contributedPower * multiplier,
    };

    const result = selectBestContributionsWithMultiplier(contributionsByType, multiplier);

    expect(result).toContainEqual(expectedBestCurry);
    expect(result).toContainEqual(expectedBestSalad);
    expect(result.length).toBe(2);
  });
});

describe('removeDuplicatePokemonCombinations', () => {
  it('shall remove duplicate pokemon combinations from array', () => {
    const pokemonCombination: CustomPokemonCombinationWithProduce = {
      customStats: {
        level: 0,
        nature: RASH,
        subskills: [],
      },
      detailedProduce: {
        helpsAfterSS: 1,
        helpsBeforeSS: 1,
        produce: {
          berries: { amount: 2, berry: LEPPA },
          ingredients: [],
        },
        sneakySnack: { amount: 10, berry: LEPPA },
        spilledIngredients: [],
      },
      pokemonCombination: {
        pokemon: PINSIR,
        ingredientList: [
          { amount: 2, ingredient: HONEY },
          { amount: 5, ingredient: FANCY_APPLE },
        ],
      },
    };

    expect(removeDuplicatePokemonCombinations([pokemonCombination, pokemonCombination])).toEqual([pokemonCombination]);
  });
});

describe('hashPokemonCombination', () => {
  it('shall hash pokemon combination', () => {
    const pokemonCombination: PokemonCombination = {
      pokemon: PINSIR,
      ingredientList: [
        { amount: 2, ingredient: HONEY },
        { amount: 5, ingredient: FANCY_APPLE },
      ],
    };

    expect(hashPokemonCombination(pokemonCombination)).toBe('PINSIR:Honey,Apple');
  });
});
