import { parseTime } from '@src/utils/time-utils/time-utils';
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
    return getOptimalFlexiblePokemon(this.#parseInputProductionStatsRequest(input));
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
      e4e: input.e4e ?? 0,
      helpingBonus: input.helpingbonus ?? 0,
      camp: input.camp ?? false,
      erb: input.erb ?? 0,
      incense: input.recoveryIncense ?? false,
      mainBedtime: parseTime(input.mainBedtime ?? '21:30'),
      mainWakeup: parseTime(input.mainWakeup ?? '06:00'),
      maxPotSize: input.maxPotSize,
    };
  }
}
