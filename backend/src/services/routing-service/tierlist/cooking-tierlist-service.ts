import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { PokemonCombinationContribution } from '../../../domain/combination/combination-contribution';
import { CombinedContribution, Contribution } from '../../../domain/computed/coverage';
import { CreateTierListRequestBody, GetTierListQueryParams } from '../../../routes/tierlist-router/tierlist-router';
import { roundDown } from '../../../utils/calculator-utils/calculator-utils';
import { getMealsForFilterWithBonus } from '../../../utils/meal-utils/meal-utils';
import {
  boostFirstMealWithFactor,
  calculateMealContributionFor,
  getAllOptimalIngredientPokemonProduce,
} from '../../calculator/contribution/contribution-calculator';
import { Logger } from '../../logger/logger';
import { SetCover } from '../../set-cover/set-cover';
import { createPokemonByIngredientReverseIndex, memo } from '../../set-cover/set-cover-utils';

class CookingTierlistImpl {
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

    const basePath60 = 'src/data/tierlist/cooking/level60/current';
    const basePath50 = 'src/data/tierlist/cooking/level50/current';

    await writeFile(`${basePath60}/overall.json`, JSON.stringify(this.create(details)));
    await writeFile(`${basePath60}/curry.json`, JSON.stringify(this.create({ ...details, curry: true, nrOfMeals: 2 })));
    await writeFile(`${basePath60}/salad.json`, JSON.stringify(this.create({ ...details, salad: true, nrOfMeals: 2 })));
    await writeFile(
      `${basePath60}/dessert.json`,
      JSON.stringify(this.create({ ...details, dessert: true, nrOfMeals: 2 }))
    );

    await writeFile(`${basePath50}/overall.json`, JSON.stringify(this.create({ ...details, limit50: true })));
    await writeFile(
      `${basePath50}/curry.json`,
      JSON.stringify(this.create({ ...details, limit50: true, curry: true, nrOfMeals: 2 }))
    );
    await writeFile(
      `${basePath50}/salad.json`,
      JSON.stringify(this.create({ ...details, limit50: true, salad: true, nrOfMeals: 2 }))
    );
    await writeFile(
      `${basePath50}/dessert.json`,
      JSON.stringify(this.create({ ...details, limit50: true, dessert: true, nrOfMeals: 2 }))
    );

    Logger.info('Finished generating cooking tier lists');
  }

  public create(details: CreateTierListRequestBody) {
    const pokemonCombinationContribution: PokemonCombinationContribution[] = [];

    const allPokemonWithProduce = getAllOptimalIngredientPokemonProduce(details);
    const memoizedSetCover = new SetCover(
      createPokemonByIngredientReverseIndex(allPokemonWithProduce),
      {
        limit50: details.limit50,
        pokemon: allPokemonWithProduce.map((p) => p.pokemonCombination.pokemon.name),
      },
      memo
    );

    const mealsForFilter = getMealsForFilterWithBonus(details);
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
        bestMeals: bestXMealsWithBoost,
        averagePercentage,
        summedContributedPower: bestXMealsWithBoost.reduce((sum, amount) => sum + amount.contributedPower, 0),
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

    return pokemonCombinationContribution.sort(
      (a, b) => b.combinedContribution.summedContributedPower - a.combinedContribution.summedContributedPower
    );
  }

  public async getTierlist(getTierListQueries: GetTierListQueryParams) {
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
    const previous: PokemonCombinationContribution[] = JSON.parse(previousFile);

    const currentFile = await readFile(currentFileName, 'utf8');
    const current: PokemonCombinationContribution[] = JSON.parse(currentFile);

    return getTierListQueries.previous ? previous : this.#diffTierlistRankings(previous, current);
  }

  #diffTierlistRankings(previous: PokemonCombinationContribution[], current: PokemonCombinationContribution[]) {
    return current; // TODO: diff rankings
  }
}

export const CookingTierlistService = new CookingTierlistImpl();
