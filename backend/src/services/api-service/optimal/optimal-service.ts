import { PokemonCombination, PokemonCombinationContributions } from '../../../domain/combination/combination';
import { CustomPokemonCombinationWithProduce } from '../../../domain/combination/custom';
import { Contribution } from '../../../domain/computed/contribution';
import { InputProductionStats, TeamWithProduce, TeamsForMeal } from '../../../domain/computed/production';
import { Island } from '../../../domain/island/island';
import { RASH } from '../../../domain/stat/nature';
import { SubskillSet } from '../../../domain/stat/subskill';
import { calculateContributionForMealWithPunishment } from '../../../services/calculator/contribution/contribution-calculator';
import { MemoizedFilters } from '../../../services/set-cover/set-cover';
import { createPokemonByIngredientReverseIndex } from '../../../services/set-cover/set-cover-utils';
import { getBerriesForIsland } from '../../../utils/berry-utils/berry-utils';
import { getMeal, getMealsAboveBonus } from '../../../utils/meal-utils/meal-utils';
import { getNature } from '../../../utils/nature-utils/nature-utils';
import {
  calculateCombinedContributions,
  removeDuplicatePokemonCombinations,
} from '../../../utils/optimal-utils/optimal-utils';
import { subskillsForFilter } from '../../../utils/subskill-utils/subskill-utils';
import {
  calculateOptimalProductionForSetCover,
  calculateSetCover,
} from '../../calculator/set-cover/calculate-set-cover';

export const FLEXIBLE_BEST_RECIPE_PER_TYPE_MULTIPLIER = 1.2;

/**
 * Runs the optimal set algorithm for a specific recipe
 *
 * API: /api/optimal/meal
 */
export function findOptimalSetsForMeal(params: {
  name: string;
  level?: number;
  island?: Island;
  goodCamp?: boolean;
  e4eProcs?: number;
  helpingBonus?: number;
  natureName?: string;
  subskillSet?: SubskillSet;
}) {
  const {
    name,
    island,
    level = 60,
    goodCamp = false,
    e4eProcs = 0,
    helpingBonus = 0,
    natureName = RASH.name,
    subskillSet = 'optimal',
  } = params;

  const berries = getBerriesForIsland(island);
  const nature = getNature(natureName);
  const subskills = subskillsForFilter(subskillSet, level);

  return customOptimalSet(name, { level, goodCamp, e4eProcs, helpingBonus, nature, subskills, berries });
}

/**
 * Scores all pokemon found in optimal team solutions in terms of flexibility
 *
 * API: /api/optimal/meal/flexible
 */
export function getOptimalFlexiblePokemon(input: InputProductionStats, solutionLimit: number) {
  const flexiblePokemonCombinations: TeamsForMeal[] = generateOptimalTeamSolutions(input, solutionLimit);

  const pokemonOccurenceInOptimalSolutions: Map<string, Contribution[]> = new Map();
  for (const { meal, teams } of flexiblePokemonCombinations) {
    const uniqueOptimalPokemonCombinationsForMeal: CustomPokemonCombinationWithProduce[] =
      removeDuplicatePokemonCombinations(teams.flat());

    // update map
    for (const pokemonWithProduce of uniqueOptimalPokemonCombinationsForMeal) {
      const contribution: Contribution = calculateContributionForMealWithPunishment({
        meal,
        teamSize: teams[0].length,
        percentage: 100,
        producedIngredients: pokemonWithProduce.detailedProduce.produce.ingredients,
      });

      const key = JSON.stringify(pokemonWithProduce.pokemonCombination);

      if (!pokemonOccurenceInOptimalSolutions.has(key)) {
        pokemonOccurenceInOptimalSolutions.set(key, [contribution]);
      } else {
        const pokemonCombinationToUpdate = pokemonOccurenceInOptimalSolutions.get(key);
        if (pokemonCombinationToUpdate) {
          pokemonOccurenceInOptimalSolutions.set(key, pokemonCombinationToUpdate.concat(contribution));
        }
      }
    }
  }

  // convert to array
  const sortedOptimalFlexiblePokemon: PokemonCombinationContributions[] = Array.from(
    pokemonOccurenceInOptimalSolutions
  ).map((pokemonCombinationWithContribution) => ({
    pokemonCombination: JSON.parse(pokemonCombinationWithContribution[0]) as PokemonCombination,
    contributions: pokemonCombinationWithContribution[1],
  }));

  const pokemonCombinationsWithScore = calculateCombinedContributions(sortedOptimalFlexiblePokemon);

  return pokemonCombinationsWithScore.sort((a, b) => b.scoreResult.score - a.scoreResult.score);
}

/**
 * Finds all optimal team solutions for all recipes for given input production stats
 *
 * @param solutionLimit If a recipe has too many optimal solutions we can use this to early exit, saving performance
 */
function generateOptimalTeamSolutions(input: InputProductionStats, solutionLimit: number) {
  const pokemonProduction = calculateOptimalProductionForSetCover(input);
  const reverseIndex = createPokemonByIngredientReverseIndex(pokemonProduction);

  const memoizedFilters: MemoizedFilters = {
    limit50: input.level < 60,
    pokemon: pokemonProduction.map((p) => p.pokemonCombination.pokemon.name),
  };
  const memoizedParams = new Map();

  const optimalTeamSolutions: TeamsForMeal[] = [];
  for (const meal of getMealsAboveBonus(0)) {
    const teamCompositionsForMeal = calculateSetCover({
      recipe: meal.ingredients,
      memoizedFilters,
      reverseIndex,
      memoizedParams,
      solutionLimit,
    });

    const allTeams: TeamWithProduce[] = teamCompositionsForMeal.map((solution) => solution.team);

    optimalTeamSolutions.push({ meal, teams: allTeams });
  }

  return optimalTeamSolutions;
}

function customOptimalSet(mealName: string, inputStats: InputProductionStats) {
  const { level, goodCamp, e4eProcs, helpingBonus, nature, subskills, berries } = inputStats;

  const meal = getMeal(mealName);

  const pokemonProduction = calculateOptimalProductionForSetCover({
    level,
    nature,
    subskills,
    berries,
    goodCamp,
    e4eProcs,
    helpingBonus,
  });

  const reverseIndex = createPokemonByIngredientReverseIndex(pokemonProduction);
  const memoizedFilters: MemoizedFilters = {
    limit50: level < 60,
    pokemon: pokemonProduction.map((p) => p.pokemonCombination.pokemon.name),
  };

  const optimalCombinations = calculateSetCover({
    recipe: meal.ingredients,
    memoizedFilters,
    reverseIndex,
    memoizedParams: new Map(),
  });

  return {
    bonus: meal.bonus,
    meal: meal.name,
    recipe: meal.ingredients,
    value: meal.value,
    filter: {
      level,
      nature,
      subskills,
      e4eProcs,
      helpingBonus,
      goodCamp,
    },
    teams: optimalCombinations,
  };
}
