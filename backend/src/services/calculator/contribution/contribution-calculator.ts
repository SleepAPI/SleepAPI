import { IngredientSet, pokemon, Recipe, RecipeType } from 'sleepapi-common';

import { CustomPokemonCombinationWithProduce } from '@src/domain/combination/custom';
import { Contribution } from '@src/domain/computed/contribution';
import { ProgrammingError } from '@src/domain/error/programming/programming-error';
import { SkillActivation } from '@src/domain/event/events/skill-event/skill-event';
import { SetCover } from '@src/services/set-cover/set-cover';
import { setupAndRunProductionSimulation } from '@src/services/simulation-service/simulation-service';
import { hashPokemonCombination } from '@src/utils/optimal-utils/optimal-utils';
import {
  calculateContributedIngredientsValue,
  calculatePercentageCoveredByCombination,
  calculateRemainingIngredients,
  combineSameIngredientsInDrop,
  getAllIngredientCombinationsForLevel,
} from '../ingredient/ingredient-calculate';
import { getOptimalStats } from '../stats/stats-calculator';

export function getAllOptimalIngredientFocusedPokemonProduce(params: {
  limit50: boolean;
  e4e: number;
  cheer: number;
  extraHelpful: number;
  monteCarloIterations: number;
}): CustomPokemonCombinationWithProduce[] {
  const { limit50, e4e, cheer, extraHelpful, monteCarloIterations } = params;
  const level = limit50 ? 50 : 60;

  const allOptimalIngredientPokemonProduce: CustomPokemonCombinationWithProduce[] = [];

  const teamStats = {
    e4e,
    cheer,
    extraHelpful,
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
  allPokemonDefaultProduce?: Map<string, CustomPokemonCombinationWithProduce>;
}): Contribution {
  const {
    meal,
    producedIngredients,
    critMultiplier,
    memoizedSetCover,
    timeout,
    defaultCritMultiplier,
    allPokemonDefaultProduce,
  } = params;

  const percentage = calculatePercentageCoveredByCombination(meal, producedIngredients);
  const remainderOfRecipe = calculateRemainingIngredients(meal.ingredients, producedIngredients);

  // if mon solves recipe alone, or does not contribute at all, we don't need to call set cover
  const shouldCalculateTeamSolutions =
    percentage > 0 || critMultiplier > defaultCritMultiplier || allPokemonDefaultProduce;

  let allSupportedIngredients: IngredientSet[] = [];
  const minAdditionalMonsNeeded: number = shouldCalculateTeamSolutions
    ? remainderOfRecipe.length > 0
      ? (() => {
          const { allSupportedIngredients: calcedSupportIngs, teamSizeRequired } = calculateTeamSizeAndSupportValue({
            remainderOfRecipe,
            memoizedSetCover,
            timeout,
            allPokemonDefaultProduce,
          });
          allSupportedIngredients = calcedSupportIngs;
          return teamSizeRequired;
        })()
      : 0
    : 6;

  return calculateContributionForMealWithPunishment({
    meal,
    teamSize: 1 + minAdditionalMonsNeeded,
    percentage,
    producedIngredients,
    supportedIngredients: allSupportedIngredients,
    critMultiplier,
    defaultCritMultiplier,
  });
}

export function calculateTeamSizeAndSupportValue(params: {
  remainderOfRecipe: IngredientSet[];
  memoizedSetCover: SetCover;
  timeout: number;
  allPokemonDefaultProduce?: Map<string, CustomPokemonCombinationWithProduce>;
}) {
  const { allPokemonDefaultProduce, memoizedSetCover, remainderOfRecipe, timeout } = params;
  let allSupportedIngredients: IngredientSet[] = [];
  let teamSizeRequired = 0;

  if (allPokemonDefaultProduce) {
    const bestSolution = memoizedSetCover.findOptimalCombinationFor(remainderOfRecipe, 4, timeout).at(0);
    if (bestSolution) {
      const supportedIngredients: IngredientSet[][] = [];
      for (const member of bestSolution.team) {
        const hashedMember = hashPokemonCombination(member.pokemonCombination);
        const defaultMember = allPokemonDefaultProduce.get(hashedMember);
        if (!defaultMember) {
          throw new ProgrammingError(`Pokemon not found in default production data: ${hashedMember}`);
        }

        supportedIngredients.push(
          calculateRemainingIngredients(
            member.detailedProduce.produce.ingredients,
            defaultMember.detailedProduce.produce.ingredients
          )
        );
      }

      allSupportedIngredients = combineSameIngredientsInDrop(supportedIngredients.flat());
    }
    teamSizeRequired = bestSolution?.team.length ?? 5;
  } else {
    teamSizeRequired = memoizedSetCover.calculateMinTeamSizeFor(remainderOfRecipe, 4, timeout);
  }

  return { teamSizeRequired, allSupportedIngredients };
}

export function calculateContributionForMealWithPunishment(params: {
  meal: Recipe;
  teamSize: number;
  percentage: number;
  producedIngredients: IngredientSet[];
  supportedIngredients: IngredientSet[];
  critMultiplier: number;
  defaultCritMultiplier: number;
}): Contribution {
  const {
    meal,
    teamSize,
    percentage,
    producedIngredients,
    supportedIngredients,
    critMultiplier,
    defaultCritMultiplier,
  } = params;
  const { contributedValue, fillerValue } = calculateContributedIngredientsValue(meal, producedIngredients);

  const teamSizePenalty = Math.max(1 - (teamSize - 1) * 0.2, 0); // clamp to 0
  const valueLeftInRecipe = meal.valueMax - contributedValue;

  const tastyChanceContribution =
    teamSizePenalty * (critMultiplier * valueLeftInRecipe - defaultCritMultiplier * valueLeftInRecipe);
  // produce support are support mons that boost produce of team members, like extra helpful and e4e
  const { contributedValue: supportedContributionValue, fillerValue: supportedFillers } =
    calculateContributedIngredientsValue(meal, supportedIngredients);

  const regularContribution = critMultiplier * contributedValue * teamSizePenalty + fillerValue;
  const supportedContribution = critMultiplier * supportedContributionValue * teamSizePenalty + supportedFillers;
  const contributedPower = regularContribution + supportedContribution + tastyChanceContribution;

  return {
    meal,
    percentage,
    contributedPower,
    skillValue: tastyChanceContribution + supportedContribution,
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
