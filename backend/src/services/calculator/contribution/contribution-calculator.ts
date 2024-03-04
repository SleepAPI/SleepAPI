import { IngredientSet, pokemon, Recipe, RecipeType } from 'sleepapi-common';

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
import { getOptimalStats } from '../stats/stats-calculator';

export function getAllOptimalIngredientFocusedPokemonProduce(params: {
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
    const customStats = getOptimalStats(level, pokemon);

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
        preGeneratedSkillActivations,
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
  meal: Recipe;
  producedIngredients: IngredientSet[];
  memoizedSetCover: SetCover;
  timeout: number;
  critMultiplier: number;
  defaultCritMultiplier: number;
}): Contribution {
  const { meal, producedIngredients, critMultiplier, memoizedSetCover, timeout, defaultCritMultiplier } = params;

  const percentage = calculatePercentageCoveredByCombination(meal, producedIngredients);
  const remainderOfRecipe = calculateRemainingIngredients(meal.ingredients, producedIngredients);

  // if mon solves recipe alone, or does not contribute at all, we don't need to call set cover
  // TODO: should calculate set cover for all support mons even if percentage===0, currently only dedenne since crit>default
  const shouldCalculateTeamSolutions = percentage > 0 || critMultiplier > defaultCritMultiplier;
  const minAdditionalMonsNeeded = shouldCalculateTeamSolutions
    ? remainderOfRecipe.length > 0
      ? memoizedSetCover.calculateMinTeamSizeFor(remainderOfRecipe, 4, timeout)
      : 0
    : 6;

  return calculateContributionForMealWithPunishment({
    meal,
    teamSize: 1 + minAdditionalMonsNeeded,
    percentage,
    producedIngredients,
    critMultiplier,
    defaultCritMultiplier,
  });
}

export function calculateContributionForMealWithPunishment(params: {
  meal: Recipe;
  teamSize: number;
  percentage: number;
  producedIngredients: IngredientSet[];
  critMultiplier: number;
  defaultCritMultiplier: number;
}): Contribution {
  const { meal, teamSize, percentage, producedIngredients, critMultiplier, defaultCritMultiplier } = params;
  const { contributedValue, fillerValue } = calculateContributedIngredientsValue(meal, producedIngredients);

  const teamSizePenalty = Math.max(1 - (teamSize - 1) * 0.2, 0); // clamp to 0
  const valueLeftInRecipe = meal.valueMax - contributedValue;
  const recipeCritContribution =
    teamSizePenalty * (critMultiplier * valueLeftInRecipe - defaultCritMultiplier * valueLeftInRecipe);

  const contributedPower = critMultiplier * (contributedValue * teamSizePenalty + fillerValue) + recipeCritContribution;

  return {
    meal,
    percentage,
    contributedPower,
    skillValue: recipeCritContribution, // TODO: add other support mons than dedenne here
  };
}

export function boostFirstMealWithFactor(factor: number, contribution: Contribution[]) {
  const firstMealWithExtraWeight: Contribution = {
    ...contribution[0],
    contributedPower: contribution[0].contributedPower * factor,
    skillValue: contribution[0].skillValue && contribution[0].skillValue * factor,
  };
  return [firstMealWithExtraWeight, ...contribution.slice(1, contribution.length)];
}

export function groupContributionsByType(contributions: Contribution[]): Record<RecipeType, Contribution[]> {
  const contributionsByType: Record<RecipeType, Contribution[]> = {
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
