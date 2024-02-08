import {
  PokemonCombinationCombinedContribution,
  PokemonIngredientSetContribution,
} from '@src/domain/combination/combination';
import { CustomPokemonCombinationWithProduce } from '@src/domain/combination/custom';
import { CombinedContribution, Contribution } from '@src/domain/computed/contribution';
import {
  CreateTierListRequestBody,
  GetTierListQueryParams,
  TieredPokemonCombinationContribution,
} from '@src/routes/tierlist-router/tierlist-router';
import {
  boostFirstMealWithFactor,
  calculateMealContributionFor,
  getAllOptimalIngredientPokemonProduce,
} from '@src/services/calculator/contribution/contribution-calculator';
import { Logger } from '@src/services/logger/logger';
import { SetCover } from '@src/services/set-cover/set-cover';
import { createPokemonByIngredientReverseIndex } from '@src/services/set-cover/set-cover-utils';
import { getMealsForFilter } from '@src/utils/meal-utils/meal-utils';
import { diffTierlistRankings } from '@src/utils/tierlist-utils/tierlist-utils';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { recipe } from 'sleepapi-common';

const TIERLIST_SET_COVER_TIMEOUT = 1000;

class TierlistImpl {
  public async seed() {
    Logger.info('Generating cooking tier lists');
    const details: CreateTierListRequestBody = {
      curry: false,
      cyan: false,
      dessert: false,
      limit50: false,
      minRecipeBonus: 0,
      maxPotSize: undefined,
      nrOfMeals: 3,
      salad: false,
      taupe: false,
      snowdrop: false,
      lapis: false,
    };

    const basePathCurrent = 'src/data/tierlist/current';
    const basePathPrevious = 'src/data/tierlist/previous';

    const generated50Data = this.generateTierListData({ ...details, limit50: true });
    const generated60Data = this.generateTierListData(details);

    // level 50 - Pot unlimited
    await this.#createTierListAndStore({
      details: { ...details, limit50: true },
      allPokemonWithContributions: generated50Data,
      writePath: `${basePathCurrent}/level50/pot-unlimited/overall.json`,
      previousPath: `${basePathPrevious}/level50/pot-unlimited/overall.json`,
    });
    await this.#createTierListAndStore({
      details: { ...details, limit50: true, curry: true, nrOfMeals: 2 },
      allPokemonWithContributions: generated50Data,
      writePath: `${basePathCurrent}/level50/pot-unlimited/curry.json`,
      previousPath: `${basePathPrevious}/level50/pot-unlimited/curry.json`,
    });
    await this.#createTierListAndStore({
      details: { ...details, limit50: true, salad: true, nrOfMeals: 2 },
      allPokemonWithContributions: generated50Data,
      writePath: `${basePathCurrent}/level50/pot-unlimited/salad.json`,
      previousPath: `${basePathPrevious}/level50/pot-unlimited/salad.json`,
    });
    await this.#createTierListAndStore({
      details: { ...details, limit50: true, dessert: true, nrOfMeals: 2 },
      allPokemonWithContributions: generated50Data,
      writePath: `${basePathCurrent}/level50/pot-unlimited/dessert.json`,
      previousPath: `${basePathPrevious}/level50/pot-unlimited/dessert.json`,
    });

    // level 50 - Pot limited
    await this.#createTierListAndStore({
      details: { ...details, limit50: true, maxPotSize: recipe.MAX_POT_SIZE },
      allPokemonWithContributions: generated50Data,
      writePath: `${basePathCurrent}/level50/pot-limited/overall.json`,
      previousPath: `${basePathPrevious}/level50/pot-limited/overall.json`,
    });
    await this.#createTierListAndStore({
      details: { ...details, limit50: true, curry: true, nrOfMeals: 2, maxPotSize: recipe.MAX_POT_SIZE },
      allPokemonWithContributions: generated50Data,
      writePath: `${basePathCurrent}/level50/pot-limited/curry.json`,
      previousPath: `${basePathPrevious}/level50/pot-limited/curry.json`,
    });
    await this.#createTierListAndStore({
      details: { ...details, limit50: true, salad: true, nrOfMeals: 2, maxPotSize: recipe.MAX_POT_SIZE },
      allPokemonWithContributions: generated50Data,
      writePath: `${basePathCurrent}/level50/pot-limited/salad.json`,
      previousPath: `${basePathPrevious}/level50/pot-limited/salad.json`,
    });
    await this.#createTierListAndStore({
      details: { ...details, limit50: true, dessert: true, nrOfMeals: 2, maxPotSize: recipe.MAX_POT_SIZE },
      allPokemonWithContributions: generated50Data,
      writePath: `${basePathCurrent}/level50/pot-limited/dessert.json`,
      previousPath: `${basePathPrevious}/level50/pot-limited/dessert.json`,
    });

    // level 60 - Pot unlimited
    await this.#createTierListAndStore({
      details,
      allPokemonWithContributions: generated60Data,
      writePath: `${basePathCurrent}/level60/pot-unlimited/overall.json`,
      previousPath: `${basePathPrevious}/level60/pot-unlimited/overall.json`,
    });
    await this.#createTierListAndStore({
      details: { ...details, curry: true, nrOfMeals: 2 },
      allPokemonWithContributions: generated60Data,
      writePath: `${basePathCurrent}/level60/pot-unlimited/curry.json`,
      previousPath: `${basePathPrevious}/level60/pot-unlimited/curry.json`,
    });
    await this.#createTierListAndStore({
      details: { ...details, salad: true, nrOfMeals: 2 },
      allPokemonWithContributions: generated60Data,
      writePath: `${basePathCurrent}/level60/pot-unlimited/salad.json`,
      previousPath: `${basePathPrevious}/level60/pot-unlimited/salad.json`,
    });
    await this.#createTierListAndStore({
      details: { ...details, dessert: true, nrOfMeals: 2 },
      allPokemonWithContributions: generated60Data,
      writePath: `${basePathCurrent}/level60/pot-unlimited/dessert.json`,
      previousPath: `${basePathPrevious}/level60/pot-unlimited/dessert.json`,
    });

    // level 60 - pot limited
    await this.#createTierListAndStore({
      details: { ...details, maxPotSize: recipe.MAX_POT_SIZE },
      allPokemonWithContributions: generated60Data,
      writePath: `${basePathCurrent}/level60/pot-limited/overall.json`,
      previousPath: `${basePathPrevious}/level60/pot-limited/overall.json`,
    });
    await this.#createTierListAndStore({
      details: { ...details, curry: true, nrOfMeals: 2, maxPotSize: recipe.MAX_POT_SIZE },
      allPokemonWithContributions: generated60Data,
      writePath: `${basePathCurrent}/level60/pot-limited/curry.json`,
      previousPath: `${basePathPrevious}/level60/pot-limited/curry.json`,
    });
    await this.#createTierListAndStore({
      details: { ...details, salad: true, nrOfMeals: 2, maxPotSize: recipe.MAX_POT_SIZE },
      allPokemonWithContributions: generated60Data,
      writePath: `${basePathCurrent}/level60/pot-limited/salad.json`,
      previousPath: `${basePathPrevious}/level60/pot-limited/salad.json`,
    });
    await this.#createTierListAndStore({
      details: { ...details, dessert: true, nrOfMeals: 2, maxPotSize: recipe.MAX_POT_SIZE },
      allPokemonWithContributions: generated60Data,
      writePath: `${basePathCurrent}/level60/pot-limited/dessert.json`,
      previousPath: `${basePathPrevious}/level60/pot-limited/dessert.json`,
    });

    Logger.info('Finished generating cooking tier lists');
  }

  public generateTierListData(details: CreateTierListRequestBody) {
    const allPokemonWithProduce = getAllOptimalIngredientPokemonProduce(details.limit50, {
      cyan: details.cyan,
      taupe: details.taupe,
      snowdrop: details.snowdrop,
      lapis: details.lapis,
    });

    const firstRunCache: Map<string, CustomPokemonCombinationWithProduce[][]> = new Map();
    const mealsForFilter = getMealsForFilter(details);
    const allPokemonWithContributions: PokemonIngredientSetContribution[] = [];

    let counter = 0;
    for (const pokemonWithProduce of allPokemonWithProduce) {
      const currentMemoryUsage = process.memoryUsage().heapUsed;
      const currentMemoryUsageGigabytes = currentMemoryUsage / 1024 ** 3;

      Logger.info('Current memory usage: ' + currentMemoryUsageGigabytes);
      const pokemonCache: Map<string, CustomPokemonCombinationWithProduce[][]> = new Map(firstRunCache);
      const cache = currentMemoryUsageGigabytes > 15 ? pokemonCache : firstRunCache;
      ++counter;
      console.time(
        `[${counter}/${allPokemonWithProduce.length}] ${pokemonWithProduce.pokemonCombination.pokemon.name}`
      );
      const memoizedSetCover = new SetCover(
        createPokemonByIngredientReverseIndex(allPokemonWithProduce),
        {
          limit50: details.limit50,
          pokemon: allPokemonWithProduce.map((p) => p.pokemonCombination.pokemon.name),
        },
        cache
      );

      const contributions: Contribution[] = [];

      for (const meal of mealsForFilter) {
        const contributionForMeal = calculateMealContributionFor({
          meal,
          producedIngredients: pokemonWithProduce.detailedProduce.produce.ingredients,
          memoizedSetCover,
          timeout: TIERLIST_SET_COVER_TIMEOUT,
        });
        contributions.push(contributionForMeal);
      }
      console.timeEnd(
        `[${counter}/${allPokemonWithProduce.length}] ${pokemonWithProduce.pokemonCombination.pokemon.name}`
      );

      allPokemonWithContributions.push({ pokemonIngredientSet: pokemonWithProduce.pokemonCombination, contributions });
    }

    return allPokemonWithContributions;
  }

  public calculateScoreAndRank(
    allPokemonWithContributions: PokemonIngredientSetContribution[],
    details: CreateTierListRequestBody,
    previous?: TieredPokemonCombinationContribution[]
  ): TieredPokemonCombinationContribution[] {
    const pokemonCombinationContribution: PokemonCombinationCombinedContribution[] = [];
    const mealsForFilter = getMealsForFilter(details);

    for (const pokemonWithContributions of allPokemonWithContributions) {
      const { pokemonIngredientSet, contributions: allContributions } = pokemonWithContributions;
      const contributions = allContributions.filter((cont) => mealsForFilter.includes(cont.meal));

      const averagePercentage = contributions.reduce((a, b) => a + b.percentage, 0) / contributions.length;
      const bestXMeals = contributions
        .sort((a, b) => b.contributedPower - a.contributedPower)
        .slice(0, details.nrOfMeals);

      const bestXMealsWithBoost = boostFirstMealWithFactor(1.5, bestXMeals);

      const combinedContribution: CombinedContribution = {
        contributions: bestXMealsWithBoost,
        averagePercentage,
        score: bestXMealsWithBoost.reduce((sum, amount) => sum + amount.contributedPower, 0),
      };

      pokemonCombinationContribution.push({
        pokemonCombination: pokemonIngredientSet,
        combinedContribution,
      });
    }

    return this.#assignTiers(
      pokemonCombinationContribution.sort((a, b) => b.combinedContribution.score - a.combinedContribution.score),
      previous
    );
  }

  public async getTierlist(
    getTierListQueries: GetTierListQueryParams
  ): Promise<TieredPokemonCombinationContribution[]> {
    const levelVersion = getTierListQueries.limit50 ? '50' : '60';
    const potLimitVersion = getTierListQueries.potLimit ? 'pot-limited' : 'pot-unlimited';
    const previousFileName = path.join(
      __dirname,
      `../../../data/tierlist/previous/level${levelVersion}/${potLimitVersion}/${getTierListQueries.tierlistType}.json`
    );
    const currentFileName = path.join(
      __dirname,
      `../../../data/tierlist/current/level${levelVersion}/${potLimitVersion}/${getTierListQueries.tierlistType}.json`
    );

    const previousFile = await readFile(previousFileName, 'utf8');
    const previous: TieredPokemonCombinationContribution[] = JSON.parse(previousFile);

    const currentFile = await readFile(currentFileName, 'utf8');
    const current: TieredPokemonCombinationContribution[] = JSON.parse(currentFile);

    return getTierListQueries.previous ? previous : current;
  }

  async #createTierListAndStore(params: {
    details: CreateTierListRequestBody;
    allPokemonWithContributions: PokemonIngredientSetContribution[];
    writePath: string;
    previousPath: string;
  }) {
    const { details, allPokemonWithContributions, writePath, previousPath } = params;

    const previousFile = await readFile(previousPath, 'utf8');
    const previous: TieredPokemonCombinationContribution[] = JSON.parse(previousFile);

    const current = this.calculateScoreAndRank(allPokemonWithContributions, details, previous);

    await writeFile(writePath, JSON.stringify(current));
  }

  #assignTiers(
    data: PokemonCombinationCombinedContribution[],
    previous?: TieredPokemonCombinationContribution[]
  ): TieredPokemonCombinationContribution[] {
    const tiers: { tier: string; bucket: number }[] = [
      { tier: 'S', bucket: 0.9 },
      { tier: 'A', bucket: 0.8 },
      { tier: 'B', bucket: 0.8 },
      { tier: 'C', bucket: 0.85 },
      { tier: 'D', bucket: 0.85 },
      { tier: 'E', bucket: 0.9 },
    ];

    let threshold = data[0].combinedContribution.score;

    const tieredEntries: TieredPokemonCombinationContribution[] = [];
    for (const entry of data) {
      let currentTier = tiers.at(0);
      if (currentTier && entry.combinedContribution.score < currentTier.bucket * threshold) {
        threshold = entry.combinedContribution.score;
        tiers.shift();
        currentTier = tiers.at(0);
      }

      tieredEntries.push({ tier: currentTier?.tier ?? 'F', pokemonCombinationContribution: entry });
    }

    return diffTierlistRankings(tieredEntries, previous);
  }
}

export const TierlistService = new TierlistImpl();
