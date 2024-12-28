import type {
  PokemonCombinationCombinedContribution,
  PokemonIngredientSetContribution
} from '@src/domain/combination/combination.js';
import type { CustomPokemonCombinationWithProduce } from '@src/domain/combination/custom.js';
import type { CombinedContribution, Contribution } from '@src/domain/computed/contribution.js';
import type {
  CreateTierListRequestBody,
  GetTierListQueryParams,
  TieredPokemonCombinationContribution
} from '@src/routes/tierlist-router/tierlist-router.js';
import {
  boostFirstMealWithFactor,
  calculateMealContributionFor,
  getAllOptimalIngredientFocusedPokemonProduce
} from '@src/services/calculator/contribution/contribution-calculator.js';
import { SetCover } from '@src/services/set-cover/set-cover.js';
import type { CritInfo } from '@src/utils/meal-utils/meal-utils.js';
import { calculateCritMultiplier, getMealsForFilter } from '@src/utils/meal-utils/meal-utils.js';
import { createPokemonByIngredientReverseIndex } from '@src/utils/set-cover-utils/set-cover-utils.js';
import { createProduceMap, diffTierlistRankings } from '@src/utils/tierlist-utils/tierlist-utils.js';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import type { Mainskill } from 'sleepapi-common';
import { MAX_POT_SIZE, METRONOME_SKILLS, MathUtils, mainskill } from 'sleepapi-common';

const TIERLIST_SET_COVER_TIMEOUT = 1000;
const MONTE_CARLO_ITERATIONS = 1000; // slows down computing a lot

class TierlistImpl {
  public async seed() {
    logger.info('Generating cooking tier lists');
    const details: CreateTierListRequestBody = {
      curry: false,
      dessert: false,
      limit50: false,
      minRecipeBonus: 0,
      maxPotSize: undefined,
      nrOfMeals: 3,
      salad: false
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
      previousPath: `${basePathPrevious}/level50/pot-unlimited/overall.json`
    });
    await this.#createTierListAndStore({
      details: { ...details, limit50: true, curry: true, nrOfMeals: 2 },
      allPokemonWithContributions: generated50Data,
      writePath: `${basePathCurrent}/level50/pot-unlimited/curry.json`,
      previousPath: `${basePathPrevious}/level50/pot-unlimited/curry.json`
    });
    await this.#createTierListAndStore({
      details: { ...details, limit50: true, salad: true, nrOfMeals: 2 },
      allPokemonWithContributions: generated50Data,
      writePath: `${basePathCurrent}/level50/pot-unlimited/salad.json`,
      previousPath: `${basePathPrevious}/level50/pot-unlimited/salad.json`
    });
    await this.#createTierListAndStore({
      details: { ...details, limit50: true, dessert: true, nrOfMeals: 2 },
      allPokemonWithContributions: generated50Data,
      writePath: `${basePathCurrent}/level50/pot-unlimited/dessert.json`,
      previousPath: `${basePathPrevious}/level50/pot-unlimited/dessert.json`
    });

    // level 50 - Pot limited
    await this.#createTierListAndStore({
      details: { ...details, limit50: true, maxPotSize: MAX_POT_SIZE },
      allPokemonWithContributions: generated50Data,
      writePath: `${basePathCurrent}/level50/pot-limited/overall.json`,
      previousPath: `${basePathPrevious}/level50/pot-limited/overall.json`
    });
    await this.#createTierListAndStore({
      details: { ...details, limit50: true, curry: true, nrOfMeals: 2, maxPotSize: MAX_POT_SIZE },
      allPokemonWithContributions: generated50Data,
      writePath: `${basePathCurrent}/level50/pot-limited/curry.json`,
      previousPath: `${basePathPrevious}/level50/pot-limited/curry.json`
    });
    await this.#createTierListAndStore({
      details: { ...details, limit50: true, salad: true, nrOfMeals: 2, maxPotSize: MAX_POT_SIZE },
      allPokemonWithContributions: generated50Data,
      writePath: `${basePathCurrent}/level50/pot-limited/salad.json`,
      previousPath: `${basePathPrevious}/level50/pot-limited/salad.json`
    });
    await this.#createTierListAndStore({
      details: { ...details, limit50: true, dessert: true, nrOfMeals: 2, maxPotSize: MAX_POT_SIZE },
      allPokemonWithContributions: generated50Data,
      writePath: `${basePathCurrent}/level50/pot-limited/dessert.json`,
      previousPath: `${basePathPrevious}/level50/pot-limited/dessert.json`
    });

    // level 60 - Pot unlimited
    await this.#createTierListAndStore({
      details,
      allPokemonWithContributions: generated60Data,
      writePath: `${basePathCurrent}/level60/pot-unlimited/overall.json`,
      previousPath: `${basePathPrevious}/level60/pot-unlimited/overall.json`
    });
    await this.#createTierListAndStore({
      details: { ...details, curry: true, nrOfMeals: 2 },
      allPokemonWithContributions: generated60Data,
      writePath: `${basePathCurrent}/level60/pot-unlimited/curry.json`,
      previousPath: `${basePathPrevious}/level60/pot-unlimited/curry.json`
    });
    await this.#createTierListAndStore({
      details: { ...details, salad: true, nrOfMeals: 2 },
      allPokemonWithContributions: generated60Data,
      writePath: `${basePathCurrent}/level60/pot-unlimited/salad.json`,
      previousPath: `${basePathPrevious}/level60/pot-unlimited/salad.json`
    });
    await this.#createTierListAndStore({
      details: { ...details, dessert: true, nrOfMeals: 2 },
      allPokemonWithContributions: generated60Data,
      writePath: `${basePathCurrent}/level60/pot-unlimited/dessert.json`,
      previousPath: `${basePathPrevious}/level60/pot-unlimited/dessert.json`
    });

    // level 60 - pot limited
    await this.#createTierListAndStore({
      details: { ...details, maxPotSize: MAX_POT_SIZE },
      allPokemonWithContributions: generated60Data,
      writePath: `${basePathCurrent}/level60/pot-limited/overall.json`,
      previousPath: `${basePathPrevious}/level60/pot-limited/overall.json`
    });
    await this.#createTierListAndStore({
      details: { ...details, curry: true, nrOfMeals: 2, maxPotSize: MAX_POT_SIZE },
      allPokemonWithContributions: generated60Data,
      writePath: `${basePathCurrent}/level60/pot-limited/curry.json`,
      previousPath: `${basePathPrevious}/level60/pot-limited/curry.json`
    });
    await this.#createTierListAndStore({
      details: { ...details, salad: true, nrOfMeals: 2, maxPotSize: MAX_POT_SIZE },
      allPokemonWithContributions: generated60Data,
      writePath: `${basePathCurrent}/level60/pot-limited/salad.json`,
      previousPath: `${basePathPrevious}/level60/pot-limited/salad.json`
    });
    await this.#createTierListAndStore({
      details: { ...details, dessert: true, nrOfMeals: 2, maxPotSize: MAX_POT_SIZE },
      allPokemonWithContributions: generated60Data,
      writePath: `${basePathCurrent}/level60/pot-limited/dessert.json`,
      previousPath: `${basePathPrevious}/level60/pot-limited/dessert.json`
    });

    logger.info('Finished generating cooking tier lists');
  }

  public generateTierListData(details: CreateTierListRequestBody) {
    const allPokemonDefaultProduce = getAllOptimalIngredientFocusedPokemonProduce({
      limit50: details.limit50,
      e4eProcs: 0,
      cheer: 0,
      extraHelpful: 0,
      monteCarloIterations: MONTE_CARLO_ITERATIONS
    });
    const defaultProduceMap = createProduceMap(allPokemonDefaultProduce);
    let preCalcedSupportMap: Map<string, CustomPokemonCombinationWithProduce> | undefined = undefined;
    const groupedByPokemonName: Record<string, CustomPokemonCombinationWithProduce[]> = allPokemonDefaultProduce.reduce(
      (accumulator, currentValue) => {
        const pokemonName = currentValue.pokemonCombination.pokemon.name;
        if (!accumulator[pokemonName]) {
          accumulator[pokemonName] = [];
        }
        accumulator[pokemonName].push(currentValue);
        return accumulator;
      },
      {} as Record<string, CustomPokemonCombinationWithProduce[]>
    );

    const mealsForFilter = getMealsForFilter(details);
    const results: PokemonIngredientSetContribution[] = [];

    const setCoverCache: Map<string, CustomPokemonCombinationWithProduce[][]> = new Map();
    const memoizedSetCover = new SetCover(
      createPokemonByIngredientReverseIndex(allPokemonDefaultProduce),
      setCoverCache
    );

    const critCache: Map<number, CritInfo> = new Map();
    const { critMultiplier: defaultCritMultiplier } = calculateCritMultiplier([], critCache);
    let counter = 0;

    const supportSkills: Mainskill[] = [
      mainskill.ENERGY_FOR_EVERYONE,
      mainskill.ENERGIZING_CHEER_S,
      mainskill.EXTRA_HELPFUL_S,
      mainskill.MOONLIGHT_CHARGE_ENERGY_S,
      mainskill.METRONOME
    ];
    Object.entries(groupedByPokemonName).forEach(([pokemonName, group]) => {
      let supportSetCover: SetCover | undefined = undefined;
      preCalcedSupportMap = undefined;

      let e4eProcs = 0;
      let cheer = 0;
      let extraHelpful = 0;
      const currentPokemonSkill = group[0].pokemonCombination.pokemon.skill;

      if (supportSkills.includes(currentPokemonSkill)) {
        if (currentPokemonSkill === mainskill.ENERGY_FOR_EVERYONE) {
          e4eProcs = group[0].detailedProduce.averageTotalSkillProcs;
        } else if (currentPokemonSkill === mainskill.ENERGIZING_CHEER_S) {
          cheer = group[0].detailedProduce.averageTotalSkillProcs;
        } else if (currentPokemonSkill === mainskill.EXTRA_HELPFUL_S) {
          extraHelpful = group[0].detailedProduce.averageTotalSkillProcs;
        } else if (currentPokemonSkill === mainskill.METRONOME) {
          e4eProcs = group[0].detailedProduce.averageTotalSkillProcs / METRONOME_SKILLS.length;
          cheer = group[0].detailedProduce.averageTotalSkillProcs / METRONOME_SKILLS.length;
          extraHelpful = group[0].detailedProduce.averageTotalSkillProcs / METRONOME_SKILLS.length;
        } else if (currentPokemonSkill.isSkill(mainskill.MOONLIGHT_CHARGE_ENERGY_S)) {
          // since moonlight works like cheer we implement it through cheer
          // we calculate moonlight's energy value and divide it into how many cheer procs that would equate
          const crits = group[0].detailedProduce.averageTotalSkillProcs * currentPokemonSkill.critChance;
          const totalEnergy = crits * mainskill.moonlightCritAmount(currentPokemonSkill.maxLevel);
          cheer = totalEnergy / mainskill.ENERGIZING_CHEER_S.maxAmount;
        }
        const supportedProduce = getAllOptimalIngredientFocusedPokemonProduce({
          limit50: details.limit50,
          e4eProcs,
          cheer,
          extraHelpful,
          monteCarloIterations: MONTE_CARLO_ITERATIONS
        });
        preCalcedSupportMap = createProduceMap(supportedProduce);
        supportSetCover = new SetCover(createPokemonByIngredientReverseIndex(supportedProduce), new Map());
      }

      for (const pokemonWithProduce of group) {
        const currentMemoryUsage = process.memoryUsage().heapUsed;
        const currentMemoryUsageGigabytes = currentMemoryUsage / 1024 ** 3;

        logger.info('Current memory usage: ' + MathUtils.round(currentMemoryUsageGigabytes, 3) + ' GB');
        ++counter;
        logger.time(`[${counter}/${allPokemonDefaultProduce.length}] ${pokemonName}`);

        const contributions: Contribution[] = [];

        const { critMultiplier } = calculateCritMultiplier(
          pokemonWithProduce.detailedProduce.skillActivations,
          critCache
        );
        for (const meal of mealsForFilter) {
          const contributionForMeal = calculateMealContributionFor({
            meal,
            currentPokemon: pokemonWithProduce,
            memoizedSetCover:
              supportSkills.includes(currentPokemonSkill) && supportSetCover ? supportSetCover : memoizedSetCover,
            timeout: TIERLIST_SET_COVER_TIMEOUT,
            critMultiplier,
            defaultCritMultiplier,
            defaultProduceMap,
            preCalcedSupportMap
          });
          contributions.push(contributionForMeal);
        }
        logger.timeEnd(`[${counter}/${allPokemonDefaultProduce.length}] ${pokemonName}`);

        results.push({ pokemonIngredientSet: pokemonWithProduce.pokemonCombination, contributions });
      }
    });

    return results;
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
        score: bestXMealsWithBoost.reduce((sum, amount) => sum + amount.contributedPower, 0)
      };

      pokemonCombinationContribution.push({
        pokemonCombination: pokemonIngredientSet,
        combinedContribution
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
      { tier: 'E', bucket: 0.9 }
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
