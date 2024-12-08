// import { CustomStats } from '@src/domain/combination/custom';
// import { TeamMember, TeamSettingsExt } from '@src/domain/combination/team';
// import { SetCoverPokemonStats } from '@src/domain/computed/production';
// import { SleepAPIError } from '@src/domain/error/sleepapi-error';
// import { calculateSimple } from '@src/services/api-service/production/production-service';
// import {
//   calculateAveragePokemonIngredientSet,
//   getAllIngredientCombinationsForLevel,
// } from '@src/services/calculator/ingredient/ingredient-calculate';
// import { calculateAverageProduce } from '@src/services/calculator/production/produce-calculator';
// import { getOptimalStats } from '@src/services/calculator/stats/stats-calculator';
// import { SetCover, SetCoverPokemonSetup, SetCoverPokemonSetupExt } from '@src/services/set-cover/set-cover';
// import { TeamSimulatorUtils } from '@src/services/simulation-service/team-simulator/team-simulator-utils';
// import {
//   combineSameIngredientsInDrop,
//   IngredientSet,
//   MEALS_IN_DAY,
//   pokemon,
//   SimplifiedIngredientSet,
//   simplifyIngredientSet,
//   simplifyPokemonIngredientSet,
// } from 'sleepapi-common';

// export function calculateOptimalProductionForSetCover(
//   input: SetCoverPokemonStats,
//   supportMembers: TeamMember[] = [],
//   iterations = 1440
// ) {
//   if (supportMembers.length > 4) {
//     throw new SleepAPIError("Can't have more than 4 support mons in the team");
//   }
//   const pokemonProduction: SetCoverPokemonSetupExt[] = [];

//   const pokemonWithCorrectBerries = pokemon.OPTIMAL_POKEDEX.filter((pokemon) =>
//     input.islandBerries.includes(pokemon.berry)
//   );
//   for (const pokemon of pokemonWithCorrectBerries) {
//     const settings: TeamSettingsExt = {
//       camp: input.camp,
//       bedtime: input.mainBedtime,
//       wakeup: input.mainWakeup,
//     };

//     const optimalStats: CustomStats = getOptimalStats(input.level, pokemon, input.camp);
//     // subskills are already filtered by level in controller
//     let member: TeamMember = {
//       pokemonSet: {
//         pokemon,
//         ingredientList: [],
//       },
//       carrySize: optimalStats.inventoryLimit,
//       externalId: 'optimal',
//       level: input.level ?? optimalStats.level,
//       nature: input.nature ?? optimalStats.nature,
//       ribbon: input.ribbon ?? optimalStats.ribbon,
//       skillLevel: optimalStats.skillLevel,
//       subskills: input.subskills ?? optimalStats.subskills,
//     };

//     let helpsPerMealWindow = 0;
//     let skillProcsPerMealWindow = 0;
//     let totalIngredients: SimplifiedIngredientSet[] = [];
//     let critMultiplier = 0;
//     const ingredientPercentage = TeamSimulatorUtils.calculateIngredientPercentage(member);
//     const berriesPerDrop = TeamSimulatorUtils.calculateNrOfBerriesPerDrop(member);

//     for (const ingredientList of getAllIngredientCombinationsForLevel(pokemon, input.level)) {
//       let averageIngredients: SimplifiedIngredientSet[] = [];
//       member = { ...member, pokemonSet: { pokemon, ingredientList } };

//       if (helpsPerMealWindow === 0 || skillProcsPerMealWindow === 0) {
//         const result = calculateSimple({ members: [...supportMembers, member], settings }, iterations);
//         const memberResult = result[result.length - 1];
//         helpsPerMealWindow = memberResult.totalHelps / MEALS_IN_DAY;
//         skillProcsPerMealWindow = memberResult.skillProcs / MEALS_IN_DAY;
//         critMultiplier = memberResult.critMultiplier;
//         averageIngredients = simplifyIngredientSet(memberResult.averageIngredients);
//         totalIngredients = simplifyIngredientSet(
//           memberResult.skillIngredients.map(({ amount, ingredient }) => ({
//             amount: amount / MEALS_IN_DAY,
//             ingredient,
//           }))
//         );
//       } else {
//         // no need to rerun sims, just use helps and skill procs to calc

//         const averagedPokemonCombination = calculateAveragePokemonIngredientSet(member.pokemonSet);
//         averageIngredients = simplifyIngredientSet(
//           calculateAverageProduce(averagedPokemonCombination, ingredientPercentage, berriesPerDrop, member.level)
//             .ingredients
//         );
//       }

//       pokemonProduction.push({
//         pokemonSet: simplifyPokemonIngredientSet(member.pokemonSet),
//         skillProcs: skillProcsPerMealWindow,
//         averageIngredients,
//         totalIngredients: combineSameIngredientsInDrop(
//           totalIngredients.concat(
//             averageIngredients.map(({ amount, ingredient }) => ({
//               amount: helpsPerMealWindow * amount,
//               ingredient,
//             }))
//           )
//         ),
//         berry: member.pokemonSet.pokemon.berry.name,
//         skill: member.pokemonSet.pokemon.skill.name,
//         critMultiplier,
//       });
//     }
//   }

//   return pokemonProduction;
// }

// export function calculateSetCover(params: {
//   recipe: IngredientSet[];
//   cache: Map<string, SetCoverPokemonSetup[][]>;
//   reverseIndex: Map<string, SetCoverPokemonSetup[]>;
//   maxTeamSize?: number;
//   timeout?: number;
// }) {
//   const { recipe, cache, reverseIndex, maxTeamSize, timeout } = params;

//   const setCover = new SetCover(reverseIndex, cache);
//   return setCover.findOptimalCombinationFor(simplifyIngredientSet(recipe), [], maxTeamSize, timeout);
// }
