import type { PokemonCombinationContributions } from '@src/domain/combination/combination.js';
import type { CustomPokemonCombinationWithProduce } from '@src/domain/combination/custom.js';
import type { Contribution } from '@src/domain/computed/contribution.js';
import { FLEXIBLE_BEST_RECIPE_PER_TYPE_MULTIPLIER } from '@src/services/api-service/optimal/optimal-service.js';
import {
  excludeContributions,
  findBestContribution,
  groupContributionsByType,
  selectTopNContributions,
  sortByContributedPowerDesc,
  sumContributedPower
} from '@src/services/calculator/contribution/contribution-calculator.js';
import type { PokemonIngredientSet, RecipeType } from 'sleepapi-common';

export interface ScoreResult {
  score: number;
  contributions: Contribution[];
  countedMeals: Contribution[];
}

export function calculateCombinedContributions(pokemonCombinationContributions: PokemonCombinationContributions[]) {
  return pokemonCombinationContributions.map(({ pokemonCombination, contributions, stats }) => {
    const score = calculateOptimalFlexibleScore(contributions);

    return {
      pokemonCombination: pokemonCombination,
      scoreResult: {
        score: score.score,
        contributions,
        countedMeals: score.countedMeals
      },
      stats
    };
  });
}

export function calculateOptimalFlexibleScore(contributions: Contribution[]): ScoreResult {
  const ADDITIONAL_RECIPES_COUNTED = 2;

  const contributionsByType = groupContributionsByType(contributions);

  const bestContributions = selectBestContributionsWithMultiplier(
    contributionsByType,
    FLEXIBLE_BEST_RECIPE_PER_TYPE_MULTIPLIER
  );
  const remainingContributions = excludeContributions(contributions, bestContributions);
  const nextBestContributions = selectTopNContributions(remainingContributions, ADDITIONAL_RECIPES_COUNTED);

  const countedMeals = [...bestContributions, ...nextBestContributions].sort(sortByContributedPowerDesc);
  const totalScore = sumContributedPower(countedMeals);

  return { score: totalScore, contributions: contributions.sort(sortByContributedPowerDesc), countedMeals };
}

export function selectBestContributionsWithMultiplier(
  contributionsByType: Record<RecipeType, Contribution[]>,
  multiplier: number
): Contribution[] {
  return Object.values(contributionsByType).flatMap((typeContributions) => {
    if (typeContributions.length === 0) return [];
    const bestContribution = findBestContribution(typeContributions);
    return [{ ...bestContribution, contributedPower: bestContribution.contributedPower * multiplier }];
  });
}

export function removeDuplicatePokemonCombinations(
  pokemonCombinations: CustomPokemonCombinationWithProduce[]
): CustomPokemonCombinationWithProduce[] {
  const seen = new Set<string>();
  const result: CustomPokemonCombinationWithProduce[] = [];
  for (const pc of pokemonCombinations) {
    const hash = hashPokemonCombination(pc.pokemonCombination);
    if (!seen.has(hash)) {
      seen.add(hash);
      result.push(pc);
    }
  }
  return result;
}

export function hashPokemonCombination(pc: PokemonIngredientSet): string {
  return pc.pokemon.name + ':' + pc.ingredientList.map((i) => i.ingredient.name).join(',');
}
