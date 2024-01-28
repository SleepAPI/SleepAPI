import { nature } from 'sleepapi-common';
import { Body, Controller, Path, Post, Route, Tags } from 'tsoa';
import { InputProductionStats } from '../../domain/computed/production';
import { InputProductionStatsRequest } from '../../routes/optimal-router/optimal-router';
import { findOptimalSetsForMeal, getOptimalFlexiblePokemon } from '../../services/api-service/optimal/optimal-service';
import { getBerriesForIsland } from '../../utils/berry-utils/berry-utils';
import { findIslandForName } from '../../utils/island-utils/island-utils';
import { getNature } from '../../utils/nature-utils/nature-utils';
import { extractSubskillsBasedOnLevel } from '../../utils/subskill-utils/subskill-utils';

@Route('api/optimal')
@Tags('optimal')
export default class OptimalController extends Controller {
  @Post('meal/flexible')
  public getFlexiblePokemon(@Body() input: InputProductionStatsRequest) {
    return getOptimalFlexiblePokemon(this.#parseInputProductionStatsRequest(input), input.optimalSetSolutionLimit);
  }

  @Post('meal/{name}')
  public getOptimalPokemonForMealRaw(@Path() name: string, @Body() input: InputProductionStatsRequest) {
    return findOptimalSetsForMeal(name, this.#parseInputProductionStatsRequest(input));
  }

  #parseInputProductionStatsRequest(input: InputProductionStatsRequest): InputProductionStats {
    const level = input.level ?? 60;

    return {
      level,
      nature: getNature(input.nature ?? nature.RASH.name),
      subskills: input.subskills ? extractSubskillsBasedOnLevel(level, input.subskills) : undefined,
      berries: getBerriesForIsland(findIslandForName(input.island)),
      e4eProcs: input.e4e ?? 0,
      helpingBonus: input.helpingbonus ?? 0,
      goodCamp: input.camp ?? false,
      maxPotSize: input.maxPotSize,
    };
  }
}
