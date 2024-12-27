import type { SetCoverProductionStats } from '@src/domain/computed/production.js';
import type { InputProductionStatsRequest } from '@src/routes/optimal-router/optimal-router.js';
import {
  findOptimalMonsForIngredient,
  findOptimalSetsForMeal
} from '@src/services/api-service/optimal/optimal-service.js';
import { getBerriesForIsland } from '@src/utils/berry-utils/berry-utils.js';
import { findIslandForName } from '@src/utils/island-utils/island-utils.js';
import { extractSubskillsBasedOnLevel } from '@src/utils/subskill-utils/subskill-utils.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import * as tsoa from '@tsoa/runtime';
import { getNature, mainskill } from 'sleepapi-common';

const { Controller, Path, Route, Tags, Body, Post } = tsoa;

@Route('api/optimal')
@Tags('optimal')
export default class OptimalController extends Controller {
  @Post('meal/{name}')
  public getOptimalPokemonForMealRaw(@Path() name: string, @Body() input: InputProductionStatsRequest) {
    return findOptimalSetsForMeal(name, this.#parseInputProductionStatsRequest(input), 500);
  }

  @Post('ingredient/{name}')
  public getOptimalPokemonForIngredientRaw(@Path() name: string, @Body() input: InputProductionStatsRequest) {
    return findOptimalMonsForIngredient(name, this.#parseInputProductionStatsRequest(input), 500);
  }

  #parseInputProductionStatsRequest(input: InputProductionStatsRequest): SetCoverProductionStats {
    const level = input.level ?? 60;

    return {
      level,
      ribbon: 4,
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
      mainBedtime: TimeUtils.parseTime(input.mainBedtime ?? '21:30'),
      mainWakeup: TimeUtils.parseTime(input.mainWakeup ?? '06:00'),
      maxPotSize: input.maxPotSize
    };
  }
}
