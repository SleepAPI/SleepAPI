import { CustomPokemonCombinationWithProduce } from '../../../domain/combination/custom';
import { Contribution } from '../../../domain/computed/coverage';
import { OPTIMAL_POKEDEX } from '../../../domain/pokemon/pokemon';
import { IngredientDrop } from '../../../domain/produce/ingredient';
import { Meal } from '../../../domain/recipe/meal';
import { CreateTierListRequestBody } from '../../../routes/tierlist-router/tierlist-router';
import { getBerriesForFilter } from '../../../utils/berry-utils/berry-utils';
import { SetCover } from '../../set-cover/set-cover';
import {
  calculateContributedIngredientsValue,
  calculatePercentageCoveredByCombination,
  calculateProducePerMealWindow,
  calculateRemainingIngredients,
  getAllIngredientCombinationsForLevel,
} from '../ingredient/ingredient-calculate';
import { getOptimalIngredientStats } from '../stats/stats-calculator';

export function getAllOptimalIngredientPokemonProduce(
  details: CreateTierListRequestBody
): CustomPokemonCombinationWithProduce[] {
  const allOptimalIngredientPokemonProduce: CustomPokemonCombinationWithProduce[] = [];

  const allowedBerries = getBerriesForFilter(details);
  const pokemonForBerries = OPTIMAL_POKEDEX.filter((pokemon) => allowedBerries.includes(pokemon.berry));

  for (const pokemon of pokemonForBerries) {
    const customStats = getOptimalIngredientStats(details.limit50 ? 50 : 60);

    for (const ingredientList of getAllIngredientCombinationsForLevel(pokemon, details.limit50 ? 50 : 60)) {
      const pokemonCombination = {
        pokemon: pokemon,
        ingredientList,
      };

      const detailedProduce = calculateProducePerMealWindow({
        pokemonCombination,
        customStats,
        combineIngredients: true,
      });

      allOptimalIngredientPokemonProduce.push({ pokemonCombination, detailedProduce, customStats });
    }
  }

  return allOptimalIngredientPokemonProduce;
}

/**
 * Calculates contribution including checking with Optimal Set
 */
export function calculateMealContributionFor(params: {
  meal: Meal;
  producedIngredients: IngredientDrop[];
  memoizedSetCover: SetCover;
}): Contribution {
  const { meal, producedIngredients, memoizedSetCover } = params;

  const percentage = calculatePercentageCoveredByCombination(meal, producedIngredients);
  const { contributedValue, fillerValue } = calculateContributedIngredientsValue(meal, producedIngredients);

  const weightedFillerValue = fillerValue;

  const contributedPower =
    contributedValue > 0
      ? calculateContributedPowerAsTeamMember(meal, producedIngredients, contributedValue, memoizedSetCover) +
        weightedFillerValue
      : weightedFillerValue;

  return { meal, percentage, contributedPower };
}

function calculateContributedPowerAsTeamMember(
  meal: Meal,
  producedIngredients: IngredientDrop[],
  rawContributedPower: number,
  memoizedSetCover: SetCover
) {
  const remainderOfRecipe = calculateRemainingIngredients(meal.ingredients, producedIngredients);

  // check if this mon solves recipe alone, if so no need to call optimal set
  const minAdditionalMonsNeeded =
    remainderOfRecipe.length > 0 ? memoizedSetCover.calculateMinTeamSizeFor(remainderOfRecipe) : 0;

  const punishmentFactor = 1 - minAdditionalMonsNeeded * 0.2;

  return rawContributedPower * punishmentFactor;
}

export function boostFirstMealWithFactor(factor: number, contribution: Contribution[]) {
  const firstMealWithExtraWeight = {
    ...contribution[0],
    contributedPower: contribution[0].contributedPower * factor,
  };
  return [firstMealWithExtraWeight, ...contribution.slice(1, contribution.length)];
}
