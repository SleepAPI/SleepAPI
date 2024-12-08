// import { CustomStats } from '@src/domain/combination/custom';
// import { TeamMember } from '@src/domain/combination/team';
// import {
//   CombinedContribution,
//   Contribution,
//   PokemonCombinationCombinedContribution,
//   PokemonIngredientSetContribution,
// } from '@src/domain/computed/contribution';
// import {
//   CreateTierListRequestBody,
//   GetTierListQueryParams,
//   TieredPokemonCombinationContribution,
// } from '@src/routes/tierlist-router/tierlist-router';
// import {
//   boostFirstMealWithFactor,
//   calculateMealContributionFor,
// } from '@src/services/calculator/contribution/contribution-calculator';
// import { calculateOptimalProductionForSetCover } from '@src/services/calculator/set-cover/calculate-set-cover';
// import { Logger } from '@src/services/logger/logger';
// import { SetCover, SetCoverPokemonSetup } from '@src/services/set-cover/set-cover';
// import { getMealsForFilter } from '@src/utils/meal-utils/meal-utils';
// import { createPokemonByIngredientReverseIndex } from '@src/utils/set-cover-utils/set-cover-utils';
// import { createProduceMap, diffTierlistRankings } from '@src/utils/tierlist-utils/tierlist-utils';
// import { access, readFile, writeFile } from 'fs/promises';
// import path from 'path';
// import {
//   AVERAGE_WEEKLY_CRIT_MULTIPLIER,
//   MAX_POT_SIZE,
//   MathUtils,
//   PokemonIngredientSet,
//   berry,
//   getIngredient,
//   getPokemon,
//   mainskill,
// } from 'sleepapi-common';

// const TIERLIST_SET_COVER_TIMEOUT = 1000;

// class TierlistImpl {
//   public async seed() {
//     Logger.info('Generating cooking tier lists');
//     const details: CreateTierListRequestBody = {
//       curry: false,
//       dessert: false,
//       limit50: false,
//       minRecipeBonus: 0,
//       maxPotSize: undefined,
//       nrOfMeals: 3,
//       salad: false,
//     };

//     const basePathCurrent = 'src/data/tierlist/current';
//     const basePathPrevious = 'src/data/tierlist/previous';

//     const generated50Data = this.generateTierListData({ ...details, limit50: true });
//     // const generated60Data = this.generateTierListData(details);

//     // level 50 - Pot unlimited
//     await this.#createTierListAndStore({
//       details: { ...details, limit50: true },
//       allPokemonWithContributions: generated50Data,
//       writePath: `${basePathCurrent}/level50/pot-unlimited/overall.json`,
//       previousPath: `${basePathPrevious}/level50/pot-unlimited/overall.json`,
//     });
//     await this.#createTierListAndStore({
//       details: { ...details, limit50: true, curry: true, nrOfMeals: 2 },
//       allPokemonWithContributions: generated50Data,
//       writePath: `${basePathCurrent}/level50/pot-unlimited/curry.json`,
//       previousPath: `${basePathPrevious}/level50/pot-unlimited/curry.json`,
//     });
//     await this.#createTierListAndStore({
//       details: { ...details, limit50: true, salad: true, nrOfMeals: 2 },
//       allPokemonWithContributions: generated50Data,
//       writePath: `${basePathCurrent}/level50/pot-unlimited/salad.json`,
//       previousPath: `${basePathPrevious}/level50/pot-unlimited/salad.json`,
//     });
//     await this.#createTierListAndStore({
//       details: { ...details, limit50: true, dessert: true, nrOfMeals: 2 },
//       allPokemonWithContributions: generated50Data,
//       writePath: `${basePathCurrent}/level50/pot-unlimited/dessert.json`,
//       previousPath: `${basePathPrevious}/level50/pot-unlimited/dessert.json`,
//     });

//     // level 50 - Pot limited
//     await this.#createTierListAndStore({
//       details: { ...details, limit50: true, maxPotSize: MAX_POT_SIZE },
//       allPokemonWithContributions: generated50Data,
//       writePath: `${basePathCurrent}/level50/pot-limited/overall.json`,
//       previousPath: `${basePathPrevious}/level50/pot-limited/overall.json`,
//     });
//     await this.#createTierListAndStore({
//       details: { ...details, limit50: true, curry: true, nrOfMeals: 2, maxPotSize: MAX_POT_SIZE },
//       allPokemonWithContributions: generated50Data,
//       writePath: `${basePathCurrent}/level50/pot-limited/curry.json`,
//       previousPath: `${basePathPrevious}/level50/pot-limited/curry.json`,
//     });
//     await this.#createTierListAndStore({
//       details: { ...details, limit50: true, salad: true, nrOfMeals: 2, maxPotSize: MAX_POT_SIZE },
//       allPokemonWithContributions: generated50Data,
//       writePath: `${basePathCurrent}/level50/pot-limited/salad.json`,
//       previousPath: `${basePathPrevious}/level50/pot-limited/salad.json`,
//     });
//     await this.#createTierListAndStore({
//       details: { ...details, limit50: true, dessert: true, nrOfMeals: 2, maxPotSize: MAX_POT_SIZE },
//       allPokemonWithContributions: generated50Data,
//       writePath: `${basePathCurrent}/level50/pot-limited/dessert.json`,
//       previousPath: `${basePathPrevious}/level50/pot-limited/dessert.json`,
//     });

//     // // level 60 - Pot unlimited
//     // await this.#createTierListAndStore({
//     //   details,
//     //   allPokemonWithContributions: generated60Data,
//     //   writePath: `${basePathCurrent}/level60/pot-unlimited/overall.json`,
//     //   previousPath: `${basePathPrevious}/level60/pot-unlimited/overall.json`,
//     // });
//     // await this.#createTierListAndStore({
//     //   details: { ...details, curry: true, nrOfMeals: 2 },
//     //   allPokemonWithContributions: generated60Data,
//     //   writePath: `${basePathCurrent}/level60/pot-unlimited/curry.json`,
//     //   previousPath: `${basePathPrevious}/level60/pot-unlimited/curry.json`,
//     // });
//     // await this.#createTierListAndStore({
//     //   details: { ...details, salad: true, nrOfMeals: 2 },
//     //   allPokemonWithContributions: generated60Data,
//     //   writePath: `${basePathCurrent}/level60/pot-unlimited/salad.json`,
//     //   previousPath: `${basePathPrevious}/level60/pot-unlimited/salad.json`,
//     // });
//     // await this.#createTierListAndStore({
//     //   details: { ...details, dessert: true, nrOfMeals: 2 },
//     //   allPokemonWithContributions: generated60Data,
//     //   writePath: `${basePathCurrent}/level60/pot-unlimited/dessert.json`,
//     //   previousPath: `${basePathPrevious}/level60/pot-unlimited/dessert.json`,
//     // });

//     // // level 60 - pot limited
//     // await this.#createTierListAndStore({
//     //   details: { ...details, maxPotSize: MAX_POT_SIZE },
//     //   allPokemonWithContributions: generated60Data,
//     //   writePath: `${basePathCurrent}/level60/pot-limited/overall.json`,
//     //   previousPath: `${basePathPrevious}/level60/pot-limited/overall.json`,
//     // });
//     // await this.#createTierListAndStore({
//     //   details: { ...details, curry: true, nrOfMeals: 2, maxPotSize: MAX_POT_SIZE },
//     //   allPokemonWithContributions: generated60Data,
//     //   writePath: `${basePathCurrent}/level60/pot-limited/curry.json`,
//     //   previousPath: `${basePathPrevious}/level60/pot-limited/curry.json`,
//     // });
//     // await this.#createTierListAndStore({
//     //   details: { ...details, salad: true, nrOfMeals: 2, maxPotSize: MAX_POT_SIZE },
//     //   allPokemonWithContributions: generated60Data,
//     //   writePath: `${basePathCurrent}/level60/pot-limited/salad.json`,
//     //   previousPath: `${basePathPrevious}/level60/pot-limited/salad.json`,
//     // });
//     // await this.#createTierListAndStore({
//     //   details: { ...details, dessert: true, nrOfMeals: 2, maxPotSize: MAX_POT_SIZE },
//     //   allPokemonWithContributions: generated60Data,
//     //   writePath: `${basePathCurrent}/level60/pot-limited/dessert.json`,
//     //   previousPath: `${basePathPrevious}/level60/pot-limited/dessert.json`,
//     // });

//     Logger.info('Finished generating cooking tier lists');
//   }

//   public generateTierListData(details: CreateTierListRequestBody) {
//     const level = details.limit50 ? 50 : 60;
//     const camp = false;
//     const allPokemonDefaultProduce = calculateOptimalProductionForSetCover({
//       level,
//       islandBerries: berry.BERRIES,
//       camp,
//       mainBedtime: { hour: 21, minute: 30, second: 0 },
//       mainWakeup: { hour: 6, minute: 0, second: 0 },
//       ribbon: 4,
//     });
//     const defaultProduceMap = createProduceMap(allPokemonDefaultProduce);
//     let preCalcedSupportMap: Map<string, SetCoverPokemonSetup> | undefined = undefined;

//     const groupedByPokemonName: Record<string, SetCoverPokemonSetupExt[]> = allPokemonDefaultProduce.reduce(
//       (accumulator, currentValue) => {
//         const pokemonName = currentValue.pokemonSet.pokemon;
//         if (!accumulator[pokemonName]) {
//           accumulator[pokemonName] = [];
//         }
//         accumulator[pokemonName].push(currentValue);
//         return accumulator;
//       },
//       {} as Record<string, SetCoverPokemonSetupExt[]>
//     );

//     const mealsForFilter = getMealsForFilter(details);
//     const results: PokemonIngredientSetContribution[] = [];

//     const memoizedSetCover = new SetCover(createPokemonByIngredientReverseIndex(allPokemonDefaultProduce), new Map());

//     let counter = 0;

//     const supportSkills: string[] = [
//       mainskill.ENERGY_FOR_EVERYONE.name,
//       mainskill.ENERGIZING_CHEER_S.name,
//       mainskill.EXTRA_HELPFUL_S.name,
//       mainskill.MOONLIGHT_CHARGE_ENERGY_S.name,
//       mainskill.METRONOME.name,
//     ];
//     Object.entries(groupedByPokemonName).forEach(([pokemonName, group]) => {
//       let supportSetCover: SetCover | undefined = undefined;
//       preCalcedSupportMap = undefined;

//       const currentPokemonSkill = group[0].skill;

//       if (supportSkills.includes(currentPokemonSkill)) {
//         const supportPokemon: PokemonIngredientSet = {
//           pokemon: getPokemon(group[0].pokemonSet.pokemon),
//           ingredientList: group[0].pokemonSet.ingredients.map(({ ingredient, amount }) => ({
//             amount,
//             ingredient: getIngredient(ingredient),
//           })),
//         };
//         const optimalStats: CustomStats = getOptimalStats(level, supportPokemon.pokemon, camp);
//         const supportMember: TeamMember = {
//           ...optimalStats,
//           pokemonSet: supportPokemon,
//           carrySize: optimalStats.inventoryLimit,
//           externalId: 'optimal',
//           level,
//         };
//         const supportedProduce = calculateOptimalProductionForSetCover(
//           {
//             level: details.limit50 ? 50 : 60,
//             islandBerries: berry.BERRIES,
//             camp: false,
//             mainBedtime: { hour: 21, minute: 30, second: 0 },
//             mainWakeup: { hour: 6, minute: 0, second: 0 },
//             ribbon: 4,
//             maxPotSize: details.maxPotSize,
//           },
//           [supportMember]
//         );
//         preCalcedSupportMap = createProduceMap(supportedProduce);
//         supportSetCover = new SetCover(createPokemonByIngredientReverseIndex(supportedProduce), new Map());
//       }

//       for (const pokemonWithProduce of group) {
//         const currentMemoryUsage = process.memoryUsage().heapUsed;
//         const currentMemoryUsageGigabytes = currentMemoryUsage / 1024 ** 3;

//         Logger.info('Current memory usage: ' + MathUtils.round(currentMemoryUsageGigabytes, 3) + ' GB');
//         ++counter;
//         console.time(`[${counter}/${allPokemonDefaultProduce.length}] ${pokemonName}`);

//         const contributions: Contribution[] = [];

//         for (const meal of mealsForFilter) {
//           // TODO: why does the new SetCoverPokemonSetup take more memory? It should be much smaller than the old cache or not?
//           // TODO: also why does Umbreon take 35 seconds for one ing list?
//           // TODO: togekiss takes 60 sec, is this the same issue? Cache got too complex? Big cache somehow?

//           // TODO: seems broken, especially tasty chance and extra helpful
//           const contributionForMeal = calculateMealContributionFor({
//             meal,
//             currentPokemon: pokemonWithProduce,
//             memoizedSetCover:
//               supportSkills.includes(currentPokemonSkill) && supportSetCover ? supportSetCover : memoizedSetCover,
//             timeout: TIERLIST_SET_COVER_TIMEOUT,
//             critMultiplier: pokemonWithProduce.critMultiplier,
//             defaultCritMultiplier: AVERAGE_WEEKLY_CRIT_MULTIPLIER,
//             defaultProduceMap,
//             preCalcedSupportMap,
//           });
//           contributions.push(contributionForMeal);
//         }
//         console.timeEnd(`[${counter}/${allPokemonDefaultProduce.length}] ${pokemonName}`);

//         results.push({ pokemonIngredientSet: pokemonWithProduce.pokemonSet, contributions });
//       }
//     });

//     return results;
//   }

//   public calculateScoreAndRank(
//     allPokemonWithContributions: PokemonIngredientSetContribution[],
//     details: CreateTierListRequestBody,
//     previous?: TieredPokemonCombinationContribution[]
//   ): TieredPokemonCombinationContribution[] {
//     const pokemonCombinationContribution: PokemonCombinationCombinedContribution[] = [];
//     const mealsForFilter = getMealsForFilter(details);

//     for (const pokemonWithContributions of allPokemonWithContributions) {
//       const { pokemonIngredientSet, contributions: allContributions } = pokemonWithContributions;
//       const contributions = allContributions.filter((cont) => mealsForFilter.includes(cont.meal));

//       const averagePercentage = contributions.reduce((a, b) => a + b.percentage, 0) / contributions.length;
//       const bestXMeals = contributions
//         .sort((a, b) => b.contributedPower - a.contributedPower)
//         .slice(0, details.nrOfMeals);

//       const bestXMealsWithBoost = boostFirstMealWithFactor(1.5, bestXMeals);

//       const combinedContribution: CombinedContribution = {
//         contributions: bestXMealsWithBoost,
//         averagePercentage,
//         score: bestXMealsWithBoost.reduce((sum, amount) => sum + amount.contributedPower, 0),
//       };

//       pokemonCombinationContribution.push({
//         pokemonCombination: pokemonIngredientSet,
//         combinedContribution,
//       });
//     }

//     return this.#assignTiers(
//       pokemonCombinationContribution.sort((a, b) => b.combinedContribution.score - a.combinedContribution.score),
//       previous
//     );
//   }

//   public async getTierlist(
//     getTierListQueries: GetTierListQueryParams
//   ): Promise<TieredPokemonCombinationContribution[]> {
//     const levelVersion = getTierListQueries.limit50 ? '50' : '60';
//     const potLimitVersion = getTierListQueries.potLimit ? 'pot-limited' : 'pot-unlimited';
//     const previousFileName = joinPath(
//       `../../../data/tierlist/previous/level${levelVersion}/${potLimitVersion}/${getTierListQueries.tierlistType}.json`
//     );
//     const currentFileName = joinPath(
//       `../../../data/tierlist/current/level${levelVersion}/${potLimitVersion}/${getTierListQueries.tierlistType}.json`
//     );

//     return getTierListQueries.previous
//       ? JSON.parse(await readFile(previousFileName, 'utf8'))
//       : JSON.parse(await readFile(currentFileName, 'utf8'));
//   }

//   async #createTierListAndStore(params: {
//     details: CreateTierListRequestBody;
//     allPokemonWithContributions: PokemonIngredientSetContribution[];
//     writePath: string;
//     previousPath: string;
//   }) {
//     const { details, allPokemonWithContributions, writePath, previousPath } = params;

//     const fileExists = await access(previousPath)
//       .then(() => true)
//       .catch(() => false);

//     if (!fileExists) {
//       return undefined;
//     }
//     const previous = fileExists
//       ? (JSON.parse(await readFile(previousPath, 'utf8')) as TieredPokemonCombinationContribution[])
//       : undefined;

//     const current = this.calculateScoreAndRank(allPokemonWithContributions, details, previous);

//     await writeFile(writePath, JSON.stringify(current));
//   }

//   #assignTiers(
//     data: PokemonCombinationCombinedContribution[],
//     previous?: TieredPokemonCombinationContribution[]
//   ): TieredPokemonCombinationContribution[] {
//     const tiers: { tier: string; bucket: number }[] = [
//       { tier: 'S', bucket: 0.9 },
//       { tier: 'A', bucket: 0.8 },
//       { tier: 'B', bucket: 0.8 },
//       { tier: 'C', bucket: 0.85 },
//       { tier: 'D', bucket: 0.85 },
//       { tier: 'E', bucket: 0.9 },
//     ];

//     let threshold = data[0].combinedContribution.score;

//     const tieredEntries: TieredPokemonCombinationContribution[] = [];
//     for (const entry of data) {
//       let currentTier = tiers.at(0);
//       if (currentTier && entry.combinedContribution.score < currentTier.bucket * threshold) {
//         threshold = entry.combinedContribution.score;
//         tiers.shift();
//         currentTier = tiers.at(0);
//       }

//       tieredEntries.push({ tier: currentTier?.tier ?? 'F', pokemonCombinationContribution: entry });
//     }

//     return diffTierlistRankings(tieredEntries, previous);
//   }
// }

// export const TierlistService = new TierlistImpl();
