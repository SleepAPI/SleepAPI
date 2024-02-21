import { IngredientSet, pokemon, recipe } from 'sleepapi-common';

import { CustomPokemonCombinationWithProduce } from '@src/domain/combination/custom';
import { Contribution } from '@src/domain/computed/contribution';
import { SkillActivation } from '@src/domain/event/events/skill-event/skill-event';
import { SetCover } from '@src/services/set-cover/set-cover';
import { setupAndRunProductionSimulation } from '@src/services/simulation-service/simulation-service';
import {
  calculateContributedIngredientsValue,
  calculatePercentageCoveredByCombination,
  calculateRemainingIngredients,
  getAllIngredientCombinationsForLevel,
} from '../ingredient/ingredient-calculate';
import { getOptimalIngredientStats } from '../stats/stats-calculator';

export function getAllOptimalIngredientPokemonProduce(params: {
  limit50: boolean;
  e4e: number;
  cheer: number;
  monteCarloIterations: number;
}): CustomPokemonCombinationWithProduce[] {
  const { limit50, e4e, cheer, monteCarloIterations } = params;
  const level = limit50 ? 50 : 60;

  const allOptimalIngredientPokemonProduce: CustomPokemonCombinationWithProduce[] = [];

  const teamStats = {
    e4e,
    cheer,
    erb: 0,
    camp: false,
    helpingBonus: 0,
    incense: false,
    mainBedtime: { hour: 21, minute: 30, second: 0 },
    mainWakeup: { hour: 6, minute: 0, second: 0 },
  };

  const allPokemon = pokemon.OPTIMAL_POKEDEX;
  for (const pokemon of allPokemon) {
    const customStats = getOptimalIngredientStats(level, pokemon);

    let preGeneratedSkillActivations: SkillActivation[] | undefined = undefined;
    for (const ingredientList of getAllIngredientCombinationsForLevel(pokemon, level)) {
      const pokemonCombination = {
        pokemon: pokemon,
        ingredientList,
      };

      const { detailedProduce, skillActivations } = setupAndRunProductionSimulation({
        pokemonCombination,
        input: { ...customStats, ...teamStats },
        monteCarloIterations,
        // TODO: can probably optimize by not shifting in simulator
        preGeneratedSkillActivations:
          preGeneratedSkillActivations && JSON.parse(JSON.stringify(preGeneratedSkillActivations)),
      });

      preGeneratedSkillActivations = skillActivations;
      allOptimalIngredientPokemonProduce.push({ pokemonCombination, detailedProduce, customStats });
    }
  }

  return allOptimalIngredientPokemonProduce;
}

/**
 * Calculates contribution including checking with Optimal Set
 */
export function calculateMealContributionFor(params: {
  meal: recipe.Recipe;
  producedIngredients: IngredientSet[];
  memoizedSetCover: SetCover;
  timeout: number;
}): Contribution {
  const { meal, producedIngredients, memoizedSetCover, timeout } = params;

  const percentage = calculatePercentageCoveredByCombination(meal, producedIngredients);
  const remainderOfRecipe = calculateRemainingIngredients(meal.ingredients, producedIngredients);

  // check if this mon solves recipe alone, if so no need to call optimal set
  const minAdditionalMonsNeeded =
    percentage > 0
      ? remainderOfRecipe.length > 0
        ? memoizedSetCover.calculateMinTeamSizeFor(remainderOfRecipe, 4, timeout)
        : 0
      : 6;

  return calculateContributionForMealWithPunishment({
    meal,
    teamSize: 1 + minAdditionalMonsNeeded,
    percentage,
    producedIngredients,
  });
}

export function calculateContributionForMealWithPunishment(params: {
  meal: recipe.Recipe;
  teamSize: number;
  percentage: number;
  producedIngredients: IngredientSet[];
}): Contribution {
  const { meal, teamSize, percentage, producedIngredients } = params;
  const { contributedValue, fillerValue } = calculateContributedIngredientsValue(meal, producedIngredients);

  const punishmentFactor = 1 - (teamSize - 1) * 0.2;
  const contributedPower = contributedValue > 0 ? contributedValue * punishmentFactor + fillerValue : fillerValue;

  return {
    meal,
    percentage,
    contributedPower,
  };
}

export function boostFirstMealWithFactor(factor: number, contribution: Contribution[]) {
  const firstMealWithExtraWeight = {
    ...contribution[0],
    contributedPower: contribution[0].contributedPower * factor,
  };
  return [firstMealWithExtraWeight, ...contribution.slice(1, contribution.length)];
}

export function groupContributionsByType(contributions: Contribution[]): Record<recipe.RecipeType, Contribution[]> {
  const contributionsByType: Record<recipe.RecipeType, Contribution[]> = {
    curry: [],
    salad: [],
    dessert: [],
  };

  contributions.forEach((contribution) => {
    contributionsByType[contribution.meal.type].push(contribution);
  });

  return contributionsByType;
}

export function selectTopNContributions(contributions: Contribution[], n: number): Contribution[] {
  return contributions.sort(sortByContributedPowerDesc).slice(0, n);
}

export function sortByContributedPowerDesc(a: Contribution, b: Contribution): number {
  return b.contributedPower - a.contributedPower;
}

export function findBestContribution(contributions: Contribution[]): Contribution {
  return contributions.reduce((prev, current) => (prev.contributedPower > current.contributedPower ? prev : current));
}

export function sumContributedPower(contributions: Contribution[]): number {
  return contributions.reduce((sum, contribution) => sum + contribution.contributedPower, 0);
}

export function excludeContributions(allContributions: Contribution[], toExclude: Contribution[]): Contribution[] {
  const toExcludeNames = new Set(toExclude.map((contribution) => contribution.meal.name));
  return allContributions.filter((contribution) => !toExcludeNames.has(contribution.meal.name));
}
