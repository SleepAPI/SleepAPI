import { InputProductionStats } from '@src/domain/computed/production';
import { getBerriesForIsland } from '@src/utils/berry-utils/berry-utils';
import { findIslandForName } from '@src/utils/island-utils/island-utils';
import { getNature } from '@src/utils/nature-utils/nature-utils';
import { extractSubskillsBasedOnLevel } from '@src/utils/subskill-utils/subskill-utils';
import { parseTime } from '@src/utils/time-utils/time-utils';
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

  #parseInputProductionStatsRequest(input: InputProductionStatsRequest): InputProductionStats {
    const level = input.level ?? 60;

    return {
      level,
      nature: input.nature ? getNature(input.nature) : undefined,
      subskills: input.subskills && extractSubskillsBasedOnLevel(level, input.subskills),
      skillLevel: input.skillLevel,
      berries: getBerriesForIsland(findIslandForName(input.island)),
      e4e: input.e4e ?? 0,
      cheer: input.cheer ?? 0,
      extraHelpful: input.extraHelpful ?? 0,
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
