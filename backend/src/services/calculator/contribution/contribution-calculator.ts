// import {
//   calculateRemainingIngredients,
//   enrichIngredientSet,
//   mainskill,
//   MAX_RECIPE_LEVEL,
//   percentageCoveredOfRecipe,
//   PokemonIngredientSetSimple,
//   Recipe,
//   recipeLevelBonus,
//   RecipeType,
//   simplifyIngredientSet,
// } from 'sleepapi-common';

// import { Contribution } from '@src/domain/computed/contribution';
// import { ProgrammingError } from '@src/domain/error/programming/programming-error';
// import { SetCover, SetCoverPokemonSetup } from '@src/services/set-cover/set-cover';
// import { hashPokemonCombination } from '@src/utils/optimal-utils/optimal-utils';
// import { calculateContributedIngredientsValue } from '../ingredient/ingredient-calculate';

// export interface TeamIngredientInfo {
//   ingredient: string;
//   defaultAmount: number;
//   selfSupportAmount: number;
//   fromSupport: number;
//   recipeAmount: number;
// }

// /**
//  * Calculates contribution including checking with Optimal Set
//  */
// export function calculateMealContributionFor(params: {
//   meal: Recipe;
//   currentPokemon: SetCoverPokemonSetup;
//   memoizedSetCover: SetCover;
//   timeout: number;
//   critMultiplier: number;
//   defaultCritMultiplier: number;
//   defaultProduceMap: Map<string, SetCoverPokemonSetup>;
//   preCalcedSupportMap?: Map<string, SetCoverPokemonSetup>;
// }): Contribution {
//   const {
//     meal,
//     currentPokemon,
//     critMultiplier,
//     memoizedSetCover,
//     timeout,
//     defaultCritMultiplier,
//     defaultProduceMap,
//     preCalcedSupportMap,
//   } = params;

//   const percentage = percentageCoveredOfRecipe(meal, currentPokemon.totalIngredients);

//   const currentPokemonDefault = defaultProduceMap.get(hashPokemonCombination(currentPokemon.pokemonSet));
//   if (!currentPokemonDefault) {
//     throw new ProgrammingError(
//       `Pokemon not found in default production map: ${hashPokemonCombination(currentPokemon.pokemonSet)}`
//     );
//   }

//   const remainderOfRecipe = calculateRemainingIngredients(
//     simplifyIngredientSet(meal.ingredients),
//     currentPokemonDefault.totalIngredients
//   );

//   // if mon solves recipe alone, or does not contribute at all, we don't need to call set cover
//   const shouldCalculateTeamSolutions = percentage > 0 || critMultiplier > defaultCritMultiplier;

//   let totalSupportedFillerIngredients: SimplifiedIngredientSet[] = [];
//   let totalSupportedUsedIngredients: SimplifiedIngredientSet[] = [];
//   let teamSize = 0;
//   let team: PokemonIngredientSetSimple[] | undefined = undefined;

//   // TODO: almost duplicated, tierlist-service also has an array of support skills
//   const supportSkills: string[] = [
//     mainskill.ENERGY_FOR_EVERYONE.name,
//     mainskill.ENERGIZING_CHEER_S.name,
//     mainskill.EXTRA_HELPFUL_S.name,
//     mainskill.METRONOME.name,
//     mainskill.HELPER_BOOST.name,
//     mainskill.MOONLIGHT_CHARGE_ENERGY_S.name,
//   ];
//   if (shouldCalculateTeamSolutions && supportSkills.includes(currentPokemon.skill)) {
//     const {
//       supportedFillerIngredients,
//       supportedUsedIngredients,
//       teamSizeRequired,
//       team: teamSolve,
//     } = calculateTeamSizeAndSupportedIngredients({
//       recipe: meal,
//       currentPokemon,
//       currentPokemonDefault,
//       memoizedSetCover,
//       timeout,
//       defaultProduceMap,
//       preCalcedSupportMap,
//     });
//     totalSupportedFillerIngredients = supportedFillerIngredients;
//     totalSupportedUsedIngredients = supportedUsedIngredients;
//     teamSize = teamSizeRequired;
//     team = teamSolve?.team.map((member) => member.pokemonSet);
//   } else if (shouldCalculateTeamSolutions) {
//     if (remainderOfRecipe.length > 0) {
//       const solution = memoizedSetCover.calculateMinTeamSizeFor(meal.ingredients, [currentPokemon], 10000);
//       teamSize = solution?.length ?? 6;
//       team = solution?.map((member) => member.pokemonSet);
//     } else {
//       teamSize = 1;
//       team = [currentPokemon.pokemonSet];
//     }
//   } else {
//     teamSize = 6;
//   }

//   return calculateContributionForMealWithPunishment({
//     meal,
//     teamSize,
//     team,
//     percentage,
//     producedIngredients: currentPokemonDefault.totalIngredients,
//     fillerSupportIngredients: totalSupportedFillerIngredients,
//     usedSupportIngredients: totalSupportedUsedIngredients,
//     critMultiplier,
//     defaultCritMultiplier,
//   });
// }

// export function calculateTeamSizeAndSupportedIngredients(params: {
//   recipe: Recipe;
//   currentPokemon: SetCoverPokemonSetup;
//   currentPokemonDefault: SetCoverPokemonSetup;
//   memoizedSetCover: SetCover;
//   timeout: number;
//   defaultProduceMap: Map<string, SetCoverPokemonSetup>;
//   preCalcedSupportMap?: Map<string, SetCoverPokemonSetup>;
// }) {
//   const {
//     recipe,
//     currentPokemon,
//     currentPokemonDefault,
//     defaultProduceMap,
//     preCalcedSupportMap,
//     memoizedSetCover,
//     timeout,
//   } = params;

//   const supportedUsedIngredients: SimplifiedIngredientSet[] = [];
//   const supportedFillerIngredients: SimplifiedIngredientSet[] = [];

//   const bestSolution = memoizedSetCover
//     .findOptimalCombinationFor(simplifyIngredientSet(recipe.ingredients), [currentPokemon], 5, timeout)
//     .at(0);

//   if (bestSolution) {
//     const teamIngredientProduction: TeamIngredientInfo[] = summarizeTeamProducedIngredientSources({
//       currentPokemonDefault,
//       team: bestSolution.team,
//       recipe,
//       defaultProduceMap,
//       preCalcedSupportMap,
//     });

//     for (const ingredientProduction of teamIngredientProduction) {
//       const { ingredient, defaultAmount, selfSupportAmount, fromSupport, recipeAmount } = ingredientProduction;

//       const totalSkillAmount = fromSupport + selfSupportAmount;
//       const amountProducedByCurrentPokemon =
//         currentPokemonDefault.totalIngredients.find(({ ingredient: ing }) => ing === ingredient)?.amount ?? 0;

//       let remainingInRecipe = Math.max(recipeAmount - amountProducedByCurrentPokemon, 0);
//       let usedSupportAmount = Math.min(selfSupportAmount, remainingInRecipe); // if there is less left in recipe than self skill gives, we take remaining in recipe as used

//       remainingInRecipe = Math.max(remainingInRecipe - selfSupportAmount, 0);

//       const inclusionFactor = remainingInRecipe / (defaultAmount - amountProducedByCurrentPokemon + fromSupport) || 0;
//       usedSupportAmount += inclusionFactor * fromSupport;
//       const fillerSupportAmount = totalSkillAmount - usedSupportAmount;

//       supportedUsedIngredients.push({ ingredient, amount: usedSupportAmount });
//       supportedFillerIngredients.push({
//         ingredient,
//         amount: fillerSupportAmount,
//       });
//     }
//   }

//   return {
//     team: bestSolution,
//     teamSizeRequired: bestSolution?.team.length ?? 6,
//     supportedUsedIngredients: supportedUsedIngredients.filter(({ amount }) => amount > 0),
//     supportedFillerIngredients: supportedFillerIngredients.filter(({ amount }) => amount > 0),
//   };
// }

// export function calculateContributionForMealWithPunishment(params: {
//   meal: Recipe;
//   teamSize: number;
//   percentage: number;
//   producedIngredients: SimplifiedIngredientSet[];
//   usedSupportIngredients: SimplifiedIngredientSet[];
//   fillerSupportIngredients: SimplifiedIngredientSet[];
//   critMultiplier: number;
//   defaultCritMultiplier: number;
//   team?: PokemonIngredientSetSimple[];
// }): Contribution {
//   const {
//     meal,
//     teamSize,
//     percentage,
//     producedIngredients,
//     usedSupportIngredients,
//     fillerSupportIngredients,
//     critMultiplier,
//     defaultCritMultiplier,
//     team,
//   } = params;
//   const { contributedValue, fillerValue } = calculateContributedIngredientsValue(meal, producedIngredients);

//   const teamSizePenalty = Math.max(1 - (teamSize - 1) * 0.2, 0);
//   const valueLeftInRecipe = meal.valueMax - contributedValue;

//   const tastyChanceContribution =
//     teamSizePenalty * (critMultiplier * valueLeftInRecipe - defaultCritMultiplier * valueLeftInRecipe);

//   const supportedUsedContributionValue = enrichIngredientSet(usedSupportIngredients).reduce(
//     (sum, cur) => sum + cur.amount * cur.ingredient.value * recipeLevelBonus[MAX_RECIPE_LEVEL] * (1 + meal.bonus / 100),
//     0
//   );
//   const supportedFillerContributionValue = enrichIngredientSet(fillerSupportIngredients).reduce(
//     (sum, cur) => sum + cur.amount * cur.ingredient.taxedValue,
//     0
//   );

//   const regularContribution = critMultiplier * contributedValue * teamSizePenalty + fillerValue;
//   const supportedContribution =
//     critMultiplier * supportedUsedContributionValue * teamSizePenalty + supportedFillerContributionValue;
//   const contributedPower = regularContribution + supportedContribution + tastyChanceContribution;

//   return {
//     meal,
//     percentage,
//     contributedPower,
//     skillValue: tastyChanceContribution + supportedContribution,
//     team,
//   };
// }

// export function boostFirstMealWithFactor(factor: number, contribution: Contribution[]) {
//   const firstMealWithExtraWeight: Contribution = {
//     ...contribution[0],
//     contributedPower: contribution[0].contributedPower * factor,
//     skillValue: contribution[0].skillValue && contribution[0].skillValue * factor,
//   };
//   return [firstMealWithExtraWeight, ...contribution.slice(1, contribution.length)];
// }

// export function groupContributionsByType(contributions: Contribution[]): Record<RecipeType, Contribution[]> {
//   const contributionsByType: Record<RecipeType, Contribution[]> = {
//     curry: [],
//     salad: [],
//     dessert: [],
//   };

//   contributions.forEach((contribution) => {
//     contributionsByType[contribution.meal.type].push(contribution);
//   });

//   return contributionsByType;
// }

// export function selectTopNContributions(contributions: Contribution[], n: number): Contribution[] {
//   return contributions.sort(sortByContributedPowerDesc).slice(0, n);
// }

// export function sortByContributedPowerDesc(a: Contribution, b: Contribution): number {
//   return b.contributedPower - a.contributedPower;
// }

// export function findBestContribution(contributions: Contribution[]): Contribution {
//   return contributions.reduce((prev, current) => (prev.contributedPower > current.contributedPower ? prev : current));
// }

// export function sumContributedPower(contributions: Contribution[]): number {
//   return contributions.reduce((sum, contribution) => sum + contribution.contributedPower, 0);
// }

// export function excludeContributions(allContributions: Contribution[], toExclude: Contribution[]): Contribution[] {
//   const toExcludeNames = new Set(toExclude.map((contribution) => contribution.meal.name));
//   return allContributions.filter((contribution) => !toExcludeNames.has(contribution.meal.name));
// }

// export function summarizeTeamProducedIngredientSources(params: {
//   currentPokemonDefault: SetCoverPokemonSetup;
//   team: SetCoverPokemonSetup[];
//   recipe: Recipe;
//   defaultProduceMap: Map<string, SetCoverPokemonSetup>;
//   preCalcedSupportMap?: Map<string, SetCoverPokemonSetup>;
// }): TeamIngredientInfo[] {
//   const { currentPokemonDefault, team, recipe, defaultProduceMap, preCalcedSupportMap } = params;
//   const teamIngredientProduction: TeamIngredientInfo[] = [];
//   let countedCurrentPokemon = false;

//   for (const member of team) {
//     const hashedMember = hashPokemonCombination(member.pokemonSet);
//     const defaultMember = defaultProduceMap?.get(hashedMember);
//     const supportMember = preCalcedSupportMap?.get(hashedMember) ?? member;

//     for (const { ingredient: memberIngredient } of member.totalIngredients) {
//       const index = teamIngredientProduction.findIndex((item) => item.ingredient === memberIngredient);

//       const defaultAmount = defaultMember?.totalIngredients.find(
//         ({ ingredient }) => ingredient === memberIngredient
//       )?.amount;
//       const boostedAmount = supportMember.totalIngredients.find(
//         ({ ingredient }) => ingredient === memberIngredient
//       )?.amount;
//       if (defaultAmount === undefined || boostedAmount === undefined) {
//         throw new ProgrammingError(`Pokemon not found in default production map: ${hashedMember}`);
//       }

//       let selfSupportAmount = 0;
//       let fromSupport = boostedAmount - defaultAmount;
//       const recipeAmount =
//         recipe.ingredients.find(({ ingredient: recipeIngredient }) => recipeIngredient.name === memberIngredient)
//           ?.amount ?? 0;

//       if (
//         !countedCurrentPokemon &&
//         hashPokemonCombination(member.pokemonSet) === hashPokemonCombination(currentPokemonDefault.pokemonSet)
//       ) {
//         countedCurrentPokemon = true;
//         selfSupportAmount = fromSupport;
//         fromSupport = 0;
//       }

//       if (index !== -1) {
//         teamIngredientProduction[index].defaultAmount += defaultAmount;
//         teamIngredientProduction[index].selfSupportAmount += selfSupportAmount;
//         teamIngredientProduction[index].fromSupport += fromSupport;
//         teamIngredientProduction[index].recipeAmount = recipeAmount;
//       } else {
//         teamIngredientProduction.push({
//           ingredient: memberIngredient,
//           defaultAmount,
//           selfSupportAmount,
//           fromSupport,
//           recipeAmount,
//         });
//       }
//     }
//   }
//   return teamIngredientProduction;
// }
