import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { PokemonCombinationCombinedContribution } from '../../../domain/combination/combination';
import { CombinedContribution, Contribution } from '../../../domain/computed/contribution';
import {
  CreateTierListRequestBody,
  GetTierListQueryParams,
  TieredPokemonCombinationContribution,
} from '../../../routes/tierlist-router/tierlist-router';
import { roundDown } from '../../../utils/calculator-utils/calculator-utils';
import { getMealsForFilter } from '../../../utils/meal-utils/meal-utils';
import { diffTierlistRankings } from '../../../utils/tierlist-utils/tierlist-utils';
import {
  boostFirstMealWithFactor,
  calculateMealContributionFor,
  getAllOptimalIngredientPokemonProduce,
} from '../../calculator/contribution/contribution-calculator';
import { Logger } from '../../logger/logger';
import { SetCover } from '../../set-cover/set-cover';
import { createPokemonByIngredientReverseIndex, memo } from '../../set-cover/set-cover-utils';

class TierlistImpl {
  public async seed() {
    Logger.info('Generating cooking tier lists');
    const details: CreateTierListRequestBody = {
      curry: false,
      cyan: false,
      dessert: false,
      limit50: false,
      minRecipeBonus: 0,
      nrOfMeals: 3,
      salad: false,
      taupe: false,
      snowdrop: false,
      lapis: false,
    };

    const basePath60 = 'src/data/tierlist/cooking/level60';
    const basePath50 = 'src/data/tierlist/cooking/level50';

    // level 60
    await this.#createTierListAndStore({
      details,
      writePath: `${basePath60}/current/overall.json`,
      previousPath: `${basePath60}/previous/overall.json`,
    });
    await this.#createTierListAndStore({
      details: { ...details, curry: true, nrOfMeals: 2 },
      writePath: `${basePath60}/current/curry.json`,
      previousPath: `${basePath60}/previous/curry.json`,
    });
    await this.#createTierListAndStore({
      details: { ...details, salad: true, nrOfMeals: 2 },
      writePath: `${basePath60}/current/salad.json`,
      previousPath: `${basePath60}/previous/salad.json`,
    });
    await this.#createTierListAndStore({
      details: { ...details, dessert: true, nrOfMeals: 2 },
      writePath: `${basePath60}/current/dessert.json`,
      previousPath: `${basePath60}/previous/dessert.json`,
    });

    // level 50
    await this.#createTierListAndStore({
      details: { ...details, limit50: true },
      writePath: `${basePath50}/current/overall.json`,
      previousPath: `${basePath50}/previous/overall.json`,
    });
    await this.#createTierListAndStore({
      details: { ...details, limit50: true, curry: true, nrOfMeals: 2 },
      writePath: `${basePath50}/current/curry.json`,
      previousPath: `${basePath50}/previous/curry.json`,
    });
    await this.#createTierListAndStore({
      details: { ...details, limit50: true, salad: true, nrOfMeals: 2 },
      writePath: `${basePath50}/current/salad.json`,
      previousPath: `${basePath50}/previous/salad.json`,
    });
    await this.#createTierListAndStore({
      details: { ...details, limit50: true, dessert: true, nrOfMeals: 2 },
      writePath: `${basePath50}/current/dessert.json`,
      previousPath: `${basePath50}/previous/dessert.json`,
    });

    Logger.info('Finished generating cooking tier lists');
  }

  public create(
    details: CreateTierListRequestBody,
    previous?: TieredPokemonCombinationContribution[]
  ): TieredPokemonCombinationContribution[] {
    const pokemonCombinationContribution: PokemonCombinationCombinedContribution[] = [];

    const allPokemonWithProduce = getAllOptimalIngredientPokemonProduce(details.limit50, {
      cyan: details.cyan,
      taupe: details.taupe,
      snowdrop: details.snowdrop,
      lapis: details.lapis,
    });

    const memoizedSetCover = new SetCover(
      createPokemonByIngredientReverseIndex(allPokemonWithProduce),
      {
        limit50: details.limit50,
        pokemon: allPokemonWithProduce.map((p) => p.pokemonCombination.pokemon.name),
      },
      memo
    );

    const mealsForFilter = getMealsForFilter(details);
    let counter = allPokemonWithProduce.length;
    for (const pokemonWithProduce of allPokemonWithProduce) {
      const contributions: Contribution[] = [];

      for (const meal of mealsForFilter) {
        const contributionForMeal = calculateMealContributionFor({
          meal,
          producedIngredients: pokemonWithProduce.detailedProduce.produce.ingredients,
          memoizedSetCover,
        });
        contributions.push(contributionForMeal);
      }

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
        pokemonCombination: pokemonWithProduce.pokemonCombination,
        combinedContribution,
      });

      Logger.debug(
        `Tierlist: Pokemon(${--counter} / ${allPokemonWithProduce.length}) Cache size(${roundDown(
          (memo.size * JSON.stringify(allPokemonWithProduce.map((p) => p.pokemonCombination.pokemon.name)).length +
            JSON.stringify(bestXMeals[0].meal.ingredients).length) /
            1024 /
            1024,
          1
        )} MB)`
      );
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
    const previousFileName = path.join(
      __dirname,
      `../../../data/tierlist/cooking/level${levelVersion}/previous/${getTierListQueries.tierlistType}.json`
    );
    const currentFileName = path.join(
      __dirname,
      `../../../data/tierlist/cooking/level${levelVersion}/current/${getTierListQueries.tierlistType}.json`
    );

    const previousFile = await readFile(previousFileName, 'utf8');
    const previous: TieredPokemonCombinationContribution[] = JSON.parse(previousFile);

    const currentFile = await readFile(currentFileName, 'utf8');
    const current: TieredPokemonCombinationContribution[] = JSON.parse(currentFile);

    return getTierListQueries.previous ? previous : current;
  }

  async #createTierListAndStore(params: {
    details: CreateTierListRequestBody;
    writePath: string;
    previousPath: string;
  }) {
    const { details, writePath, previousPath } = params;

    const previousFile = await readFile(previousPath, 'utf8');
    const previous: TieredPokemonCombinationContribution[] = JSON.parse(previousFile);

    const current = this.create(details, previous);

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
