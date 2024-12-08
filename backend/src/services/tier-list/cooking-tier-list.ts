// import { CustomStats } from '@src/domain/combination/custom';
// import { TeamMember, TeamSettingsExt } from '@src/domain/combination/team';
// import { calculateSimple } from '@src/services/api-service/production/production-service';
// import { getAllIngredientCombinationsForLevel } from '@src/services/calculator/ingredient/ingredient-calculate';
// import { SetCoverPokemonSetup } from '@src/services/set-cover/set-cover';
// import {
//   combineSameIngredientsInDrop,
//   ingredient,
//   IngredientSet,
//   mainskill,
//   MEALS_IN_DAY,
//   pokemon,
//   Time,
// } from 'sleepapi-common';

// const SUPPORT_SKILLS: Record<string, boolean> = {
//   [mainskill.ENERGY_FOR_EVERYONE.name]: true,
//   [mainskill.ENERGIZING_CHEER_S.name]: true,
//   [mainskill.EXTRA_HELPFUL_S.name]: true,
//   [mainskill.MOONLIGHT_CHARGE_ENERGY_S.name]: true,
//   [mainskill.METRONOME.name]: true,
// };

// class CookingTierListImpl {
//   bedtime: Time = { hour: 21, minute: 30, second: 0 };
//   wakeup: Time = { hour: 6, minute: 0, second: 0 };

//   public generate() {
//     // TODO: 4 versions
//   }

//   // TODO: use flat array, I think this might heavily optimize set cover
//   public generateData(params: { level: number; camp: boolean }) {
//     const { level, camp } = params;
//     const settings: TeamSettingsExt = { bedtime: this.bedtime, wakeup: this.wakeup, camp };

//     const defaultProduction: SetCoverPokemonSetupExt[] = this.generateDefaultProduction({ level, camp, settings });
//   }

//   private generateDefaultProduction(params: { level: number; camp: boolean; settings: TeamSettingsExt }) {
//     const { level, camp, settings } = params;

//     const defaultProduction: Map<string, SetCoverPokemonSetup> = new Map();
//     // pre-initialize reverseIndex to have one index for each ingredient, default to empty array producers
//     const reverseIndex: SetCoverPokemonSetup[][] = Array.from({ length: ingredient.INGREDIENTS.length }, () => []);
//     const groupedByPokemonName: Record<string, SetCoverPokemonSetup[]> = {};

//     for (const pkmn of pokemon.OPTIMAL_POKEDEX) {
//       const stats = getOptimalStats(level, pkmn, camp);

//       const ingredientLists = getAllIngredientCombinationsForLevel(pkmn, level);
//       const [firstIngredientList, ...otherIngredientLists] = ingredientLists;

//       const member = this.memberWithOptimalStats({ pokemon: pkmn, ingredientList: firstIngredientList }, stats);

//       // we grab first for performance, find would be safer
//       // this only works if we send support mons in after, but currently this doesnt use support mons
//       const { critMultiplier, skillProcs, totalHelps, ingredientPercentage, skillIngredients } = calculateSimple({
//         members: [member],
//         settings,
//       })[0];

//       for (const ingredientList of otherIngredientLists) {
//         const ingredientListProduction = this.simpleResultToProduction({
//           pokemonSet: {
//             pokemon: pkmn,
//             ingredientList: ingredientList,
//           },
//           critMultiplier,
//           helps: totalHelps / MEALS_IN_DAY,
//           skillProcs: skillProcs / MEALS_IN_DAY,
//           ingredientPercentage,
//           skillIngredients,
//         });

//         for (let ING_ID = 0, len = ingredientListProduction.totalIngredients.length; ING_ID < len; ING_ID++) {
//           // Push if this pokemon produces this ingredient
//           if (ingredientListProduction.totalIngredients[ING_ID] > 0) {
//             reverseIndex[ING_ID].push(ingredientListProduction);
//           }
//         }
//       }
//     }

//     for (let ING_ID = 0; ING_ID < reverseIndex.length; ING_ID++) {
//       // In-place sort by descending order of totalIngredients[key]
//       // In-place avoids memory reassignment
//       reverseIndex[ING_ID].sort((a, b) => b.totalIngredients[ING_ID] - a.totalIngredients[ING_ID]);
//     }

//     return { defaultProduction, reverseIndex, groupedByPokemonName };
//   }

//   private simpleResultToProduction(params: {
//     pokemonSet: PokemonIngredientSet;
//     critMultiplier: number;
//     helps: number;
//     skillProcs: number;
//     ingredientPercentage: number;
//     skillIngredients: IngredientSet[];
//   }): SetCoverPokemonSetup {
//     const { pokemonSet, critMultiplier, skillProcs, helps, ingredientPercentage, skillIngredients } = params;

//     const simplifiedIngredientList = simplifyIngredientSet(pokemonSet.ingredientList);
//     const averageIngredients = calculateAverageIngredientsPerDrop(simplifiedIngredientList, ingredientPercentage);
//     const producedIngredients = averageIngredients.map(({ amount, ingredient }) => ({
//       amount: helps * amount,
//       ingredient,
//     }));

//     const totalIngredients: IngredientSetSimple[] = combineSameIngredientsInDrop(
//       simplifyIngredientSet(skillIngredients).concat(producedIngredients)
//     );

//     return {
//       pokemonSet: {
//         pokemon: pokemonSet.pokemon.name,
//         ingredients: simplifiedIngredientList,
//       },
//       averageIngredients,
//       totalIngredients,
//       critMultiplier,
//       skillProcs,
//       skill: pokemonSet.pokemon.skill.name,
//       berry: pokemonSet.pokemon.berry.name,
//     };
//   }

//   private memberWithOptimalStats(pokemonSet: PokemonIngredientSet, stats: CustomStats): TeamMember {
//     return {
//       pokemonSet,
//       carrySize: stats.inventoryLimit,
//       externalId: 'optimal',
//       level: stats.level,
//       nature: stats.nature,
//       ribbon: stats.ribbon,
//       skillLevel: stats.skillLevel,
//       subskills: stats.subskills,
//     };
//   }
// }

// export const CookingTierList = new CookingTierListImpl();
