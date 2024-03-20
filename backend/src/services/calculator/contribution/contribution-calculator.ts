import {
  ingredient,
  IngredientSet,
  mainskill,
  MAX_RECIPE_LEVEL,
  pokemon,
  Recipe,
  RecipeType,
  utils,
} from 'sleepapi-common';

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
  getAllIngredientCombinationsForLevel,
} from '../ingredient/ingredient-calculate';
import { getOptimalStats } from '../stats/stats-calculator';

export interface TeamIngredientInfo {
  ingredient: ingredient.Ingredient;
  defaultAmount: number;
  selfSupportAmount: number;
  fromSupport: number;
  recipeAmount: number;
}

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
    helperBoostProcs: 0,
    helperBoostUnique: 0,
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

      const { detailedProduce, averageProduce, skillActivations } = setupAndRunProductionSimulation({
        pokemonCombination,
        input: { ...customStats, ...teamStats },
        monteCarloIterations,
        preGeneratedSkillActivations,
      });

      preGeneratedSkillActivations = skillActivations;
      allOptimalIngredientPokemonProduce.push({ pokemonCombination, detailedProduce, averageProduce, customStats });
    }
  }

  return allOptimalIngredientPokemonProduce;
}

/**
 * Calculates contribution including checking with Optimal Set
 */
export function calculateMealContributionFor(params: {
  meal: Recipe;
  currentPokemon: CustomPokemonCombinationWithProduce;
  memoizedSetCover: SetCover;
  timeout: number;
  critMultiplier: number;
  defaultCritMultiplier: number;
  defaultProduceMap: Map<string, CustomPokemonCombinationWithProduce>;
  preCalcedSupportMap?: Map<string, CustomPokemonCombinationWithProduce>;
}): Contribution {
  const {
    meal,
    currentPokemon,
    critMultiplier,
    memoizedSetCover,
    timeout,
    defaultCritMultiplier,
    defaultProduceMap,
    preCalcedSupportMap,
  } = params;

  const percentage = calculatePercentageCoveredByCombination(meal, currentPokemon.detailedProduce.produce.ingredients);

  const currentPokemonDefault = defaultProduceMap.get(hashPokemonCombination(currentPokemon.pokemonCombination));
  if (!currentPokemonDefault) {
    throw new ProgrammingError(
      `Pokemon not found in default production map: ${hashPokemonCombination(currentPokemon.pokemonCombination)}`
    );
  }

  const remainderOfRecipe = calculateRemainingIngredients(
    meal.ingredients,
    currentPokemonDefault.detailedProduce.produce.ingredients
  );

  // if mon solves recipe alone, or does not contribute at all, we don't need to call set cover
  const shouldCalculateTeamSolutions = percentage > 0 || critMultiplier > defaultCritMultiplier;

  let totalSupportedFillerIngredients: IngredientSet[] = [];
  let totalSupportedUsedIngredients: IngredientSet[] = [];
  let teamSize = 0;

  const supportSkills: mainskill.MainSkill[] = [
    mainskill.ENERGY_FOR_EVERYONE,
    mainskill.ENERGIZING_CHEER_S,
    mainskill.EXTRA_HELPFUL_S,
    mainskill.METRONOME,
    mainskill.HELPER_BOOST,
  ];
  if (shouldCalculateTeamSolutions && supportSkills.includes(currentPokemon.pokemonCombination.pokemon.skill)) {
    const { supportedFillerIngredients, supportedUsedIngredients, teamSizeRequired } =
      calculateTeamSizeAndSupportedIngredients({
        recipe: meal,
        currentPokemon,
        currentPokemonDefault,
        memoizedSetCover,
        timeout,
        defaultProduceMap,
        preCalcedSupportMap,
      });
    totalSupportedFillerIngredients = supportedFillerIngredients;
    totalSupportedUsedIngredients = supportedUsedIngredients;
    teamSize = teamSizeRequired;
  } else if (shouldCalculateTeamSolutions) {
    if (remainderOfRecipe.length > 0) {
      teamSize = memoizedSetCover.calculateMinTeamSizeFor(meal.ingredients, [currentPokemon], undefined, 10000);
    } else {
      teamSize = 1;
    }
  } else {
    teamSize = 6;
  }

  return calculateContributionForMealWithPunishment({
    meal,
    teamSize,
    percentage,
    producedIngredients: currentPokemonDefault.detailedProduce.produce.ingredients,
    fillerSupportIngredients: totalSupportedFillerIngredients,
    usedSupportIngredients: totalSupportedUsedIngredients,
    critMultiplier,
    defaultCritMultiplier,
  });
}

export function calculateTeamSizeAndSupportedIngredients(params: {
  recipe: Recipe;
  currentPokemon: CustomPokemonCombinationWithProduce;
  currentPokemonDefault: CustomPokemonCombinationWithProduce;
  memoizedSetCover: SetCover;
  timeout: number;
  defaultProduceMap: Map<string, CustomPokemonCombinationWithProduce>;
  preCalcedSupportMap?: Map<string, CustomPokemonCombinationWithProduce>;
}) {
  const {
    recipe,
    currentPokemon,
    currentPokemonDefault,
    defaultProduceMap,
    preCalcedSupportMap,
    memoizedSetCover,
    timeout,
  } = params;

  const supportedUsedIngredients: IngredientSet[] = [];
  const supportedFillerIngredients: IngredientSet[] = [];

  const bestSolution = memoizedSetCover
    .findOptimalCombinationFor(recipe.ingredients, [currentPokemon], 5, timeout)
    .at(0);

  if (bestSolution) {
    const teamIngredientProduction: TeamIngredientInfo[] = summarizeTeamProducedIngredientSources({
      currentPokemonDefault,
      team: bestSolution.team,
      recipe,
      defaultProduceMap,
      preCalcedSupportMap,
    });

    for (const ingredientProduction of teamIngredientProduction) {
      const { ingredient, defaultAmount, selfSupportAmount, fromSupport, recipeAmount } = ingredientProduction;

      const totalSkillAmount = fromSupport + selfSupportAmount;
      const amountProducedByCurrentPokemon =
        currentPokemonDefault.detailedProduce.produce.ingredients.find(({ ingredient: ing }) => ing === ingredient)
          ?.amount ?? 0;

      let remainingInRecipe = Math.max(recipeAmount - amountProducedByCurrentPokemon, 0);
      let usedSupportAmount = Math.min(selfSupportAmount, remainingInRecipe); // if there is less left in recipe than self skill gives, we take remaining in recipe as used

      remainingInRecipe = Math.max(remainingInRecipe - selfSupportAmount, 0);

      const inclusionFactor = remainingInRecipe / (defaultAmount - amountProducedByCurrentPokemon + fromSupport) || 0;
      usedSupportAmount += inclusionFactor * fromSupport;
      const fillerSupportAmount = totalSkillAmount - usedSupportAmount;
      // console.log(
      //   `[${ingredientProduction.ingredient.name}]: recipe needs: ${recipeAmount}, ${currentPokemon.pokemonCombination.pokemon.name} total from skill: ${totalSkillAmount}\n` +
      //     `remove ${currentPokemon.pokemonCombination.pokemon.name} base from recipe ${amountProducedByCurrentPokemon}\n` +
      //     `remove ${
      //       currentPokemon.pokemonCombination.pokemon.name
      //     } self skill from recipe and count as used: ${Math.min(
      //       selfSupportAmount,
      //       Math.max(recipeAmount - amountProducedByCurrentPokemon, 0)
      //     )}\n` +
      //     `Remaining in recipe: ${remainingInRecipe}, used: ${Math.min(
      //       selfSupportAmount,
      //       Math.max(recipeAmount - amountProducedByCurrentPokemon, 0)
      //     )}, filler: 0, ${currentPokemon.pokemonCombination.pokemon.name} remaining skill: ${fromSupport}\n` +
      //     `Calculate inclusionFactor (remaining recipe / (base-${
      //       currentPokemon.pokemonCombination.pokemon.name
      //     } base + remaining skill)): ${remainingInRecipe} / (${
      //       defaultAmount - amountProducedByCurrentPokemon
      //     } + ${fromSupport}) = ${inclusionFactor}\n` +
      //     `Add inclusionFactor * remaining skill to used. ${Math.min(
      //       selfSupportAmount,
      //       Math.max(recipeAmount - amountProducedByCurrentPokemon, 0)
      //     )} + (${inclusionFactor} * ${fromSupport}) = ${usedSupportAmount}\n` +
      //     `Add rest of remaining skill to filler: ${totalSkillAmount} - ${usedSupportAmount} = ${fillerSupportAmount}\n` +
      //     `Result: used ${usedSupportAmount}, filler ${fillerSupportAmount}`
      // );

      supportedUsedIngredients.push({ ingredient, amount: usedSupportAmount });
      supportedFillerIngredients.push({
        ingredient,
        amount: fillerSupportAmount,
      });
    }
  }

  return {
    teamSizeRequired: bestSolution?.team.length ?? 6,
    supportedUsedIngredients: supportedUsedIngredients.filter(({ amount }) => amount > 0),
    supportedFillerIngredients: supportedFillerIngredients.filter(({ amount }) => amount > 0),
  };
}

export function calculateContributionForMealWithPunishment(params: {
  meal: Recipe;
  teamSize: number;
  percentage: number;
  producedIngredients: IngredientSet[];
  usedSupportIngredients: IngredientSet[];
  fillerSupportIngredients: IngredientSet[];
  critMultiplier: number;
  defaultCritMultiplier: number;
}): Contribution {
  const {
    meal,
    teamSize,
    percentage,
    producedIngredients,
    usedSupportIngredients,
    fillerSupportIngredients,
    critMultiplier,
    defaultCritMultiplier,
  } = params;
  const { contributedValue, fillerValue } = calculateContributedIngredientsValue(meal, producedIngredients);

  const teamSizePenalty = Math.max(1 - (teamSize - 1) * 0.2, 0);
  const valueLeftInRecipe = meal.valueMax - contributedValue;

  const tastyChanceContribution =
    teamSizePenalty * (critMultiplier * valueLeftInRecipe - defaultCritMultiplier * valueLeftInRecipe);

  const supportedUsedContributionValue = usedSupportIngredients.reduce(
    (sum, cur) =>
      sum + cur.amount * cur.ingredient.value * utils.recipeLevelBonus[MAX_RECIPE_LEVEL] * (1 + meal.bonus / 100),
    0
  );
  const supportedFillerContributionValue = fillerSupportIngredients.reduce(
    (sum, cur) => sum + cur.amount * cur.ingredient.taxedValue,
    0
  );

  const regularContribution = critMultiplier * contributedValue * teamSizePenalty + fillerValue;
  const supportedContribution =
    critMultiplier * supportedUsedContributionValue * teamSizePenalty + supportedFillerContributionValue;
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

export function summarizeTeamProducedIngredientSources(params: {
  currentPokemonDefault: CustomPokemonCombinationWithProduce;
  team: CustomPokemonCombinationWithProduce[];
  recipe: Recipe;
  defaultProduceMap: Map<string, CustomPokemonCombinationWithProduce>;
  preCalcedSupportMap?: Map<string, CustomPokemonCombinationWithProduce>;
}): TeamIngredientInfo[] {
  const { currentPokemonDefault, team, recipe, defaultProduceMap, preCalcedSupportMap } = params;
  const teamIngredientProduction: TeamIngredientInfo[] = [];
  let countedCurrentPokemon = false;

  for (const member of team) {
    const hashedMember = hashPokemonCombination(member.pokemonCombination);
    const defaultMember = defaultProduceMap?.get(hashedMember);
    const supportMember = preCalcedSupportMap?.get(hashedMember) ?? member;

    for (const { ingredient: memberIngredient } of member.detailedProduce.produce.ingredients) {
      const index = teamIngredientProduction.findIndex((item) => item.ingredient === memberIngredient);

      const defaultAmount = defaultMember?.detailedProduce.produce.ingredients.find(
        ({ ingredient }) => ingredient === memberIngredient
      )?.amount;
      const boostedAmount = supportMember.detailedProduce.produce.ingredients.find(
        ({ ingredient }) => ingredient === memberIngredient
      )?.amount;
      if (!defaultAmount || !boostedAmount) {
        throw new ProgrammingError(`Pokemon not found in default production map: ${hashedMember}`);
      }

      let selfSupportAmount = 0;
      let fromSupport = boostedAmount - defaultAmount;
      const recipeAmount =
        recipe.ingredients.find(({ ingredient: recipeIngredient }) => recipeIngredient === memberIngredient)?.amount ??
        0;

      if (
        !countedCurrentPokemon &&
        hashPokemonCombination(member.pokemonCombination) ===
          hashPokemonCombination(currentPokemonDefault.pokemonCombination)
      ) {
        countedCurrentPokemon = true;
        selfSupportAmount = fromSupport;
        fromSupport = 0;
      }

      if (index !== -1) {
        teamIngredientProduction[index].defaultAmount += defaultAmount;
        teamIngredientProduction[index].selfSupportAmount += selfSupportAmount;
        teamIngredientProduction[index].fromSupport += fromSupport;
        teamIngredientProduction[index].recipeAmount = recipeAmount;
      } else {
        teamIngredientProduction.push({
          ingredient: memberIngredient,
          defaultAmount,
          selfSupportAmount,
          fromSupport,
          recipeAmount,
        });
      }
    }
  }
  return teamIngredientProduction;
}
