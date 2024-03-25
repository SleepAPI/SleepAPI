import { CustomPokemonCombinationWithProduce, CustomStats } from '@src/domain/combination/custom';
import { SetCoverProductionStats } from '@src/domain/computed/production';
import { PokemonError } from '@src/domain/error/pokemon/pokemon-error';
import { setupAndRunProductionSimulation } from '@src/services/simulation-service/simulation-service';
import { getBerriesForIsland } from '@src/utils/berry-utils/berry-utils';
import { findIslandForName } from '@src/utils/island-utils/island-utils';
import { getNature } from '@src/utils/nature-utils/nature-utils';
import { extractSubskillsBasedOnLevel, limitSubSkillsToLevel } from '@src/utils/subskill-utils/subskill-utils';
import { parseTime } from '@src/utils/time-utils/time-utils';
import { DEFAULT_RAIKOU, PokemonIngredientSet, mainskill, pokemon } from 'sleepapi-common';
import { Body, Controller, Path, Post, Route, Tags } from 'tsoa';
import { InputProductionStatsRequest } from '../../routes/optimal-router/optimal-router';
import { findOptimalSetsForMeal, getOptimalFlexiblePokemon } from '../../services/api-service/optimal/optimal-service';

@Route('api/optimal')
@Tags('optimal')
export default class OptimalController extends Controller {
  @Post('meal/flexible')
  public getFlexiblePokemon(@Body() input: InputProductionStatsRequest) {
    return getOptimalFlexiblePokemon(this.#parseInputProductionStatsRequest(input), 500);
  }

  @Post('meal/{name}')
  public getOptimalPokemonForMealRaw(@Path() name: string, @Body() input: InputProductionStatsRequest) {
    return findOptimalSetsForMeal(name, this.#parseInputProductionStatsRequest(input), 500);
  }

  #parseInputProductionStatsRequest(input: InputProductionStatsRequest): SetCoverProductionStats {
    const level = input.level ?? 60;

    const setCoverInput: SetCoverProductionStats = {
      level,
      nature: input.nature ? getNature(input.nature) : undefined,
      subskills: input.subskills && extractSubskillsBasedOnLevel(level, input.subskills),
      skillLevel: input.skillLevel,
      berries: getBerriesForIsland(findIslandForName(input.island)),
      e4eProcs: input.e4eProcs ?? 0,
      e4eLevel: input.e4eLevel ?? mainskill.ENERGY_FOR_EVERYONE.maxLevel,
      cheer: input.cheer ?? 0,
      extraHelpful: input.extraHelpful ?? 0,
      helperBoostProcs: input.helperBoostProcs ?? 0,
      helperBoostUnique: input.helperBoostUnique ?? 0,
      helperBoostLevel: input.helperBoostLevel ?? mainskill.HELPER_BOOST.maxLevel,
      helpingBonus: input.helpingbonus ?? 0,
      camp: input.camp ?? false,
      erb: input.erb ?? 0,
      incense: input.recoveryIncense ?? false,
      mainBedtime: parseTime(input.mainBedtime ?? '21:30'),
      mainWakeup: parseTime(input.mainWakeup ?? '06:00'),
      maxPotSize: input.maxPotSize,
    };

    const legendary = this.#createDefaultLegendary(setCoverInput, input.legendary);

    return {
      ...setCoverInput,
      legendary,
    };
  }

  #createDefaultLegendary(
    setCoverInput: SetCoverProductionStats,
    maybeLegendary?: string
  ): CustomPokemonCombinationWithProduce | undefined {
    if (!maybeLegendary) {
      return undefined;
    }

    const legendaryPokemon = pokemon.OPTIMAL_POKEDEX.find((pkmn) => pkmn.name === maybeLegendary);
    if (!legendaryPokemon) {
      throw new PokemonError(`Can't find legendary Pokémon with name ${maybeLegendary}`);
    }

    const unlockedIngredients = Math.ceil((setCoverInput.level + 1) / 30);
    const pokemonCombination: PokemonIngredientSet = {
      pokemon: DEFAULT_RAIKOU.pokemonSet.pokemon,
      ingredientList: DEFAULT_RAIKOU.pokemonSet.ingredientList.slice(0, unlockedIngredients),
    };
    const customStats: CustomStats = {
      nature: DEFAULT_RAIKOU.stats.nature,
      level: setCoverInput.level,
      subskills: limitSubSkillsToLevel(DEFAULT_RAIKOU.stats.subskills, setCoverInput.level),
      skillLevel: DEFAULT_RAIKOU.stats.skillLevel,
    };

    const { averageProduce, detailedProduce } = setupAndRunProductionSimulation({
      pokemonCombination,
      input: {
        ...setCoverInput,
        ...customStats,
      },
      monteCarloIterations: 0,
    });

    return {
      pokemonCombination,
      customStats,
      averageProduce,
      detailedProduce,
    };
  }
}
