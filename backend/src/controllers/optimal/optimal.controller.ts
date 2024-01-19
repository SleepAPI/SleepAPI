import { Body, Controller, Path, Post, Route, Tags } from 'tsoa';
import { InputProductionStats } from '../../domain/computed/production';
import { RASH } from '../../domain/stat/nature';
import { HELPING_SPEED_M, INGREDIENT_FINDER_M, INVENTORY_L } from '../../domain/stat/subskill';
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
    const solutionLimit = input.optimalSetSolutionLimit ?? 5000;
    return getOptimalFlexiblePokemon(this.#parseInputProductionStatsRequest(input), solutionLimit);
  }

  @Post('meal/{name}')
  public getOptimalPokemonForMealRaw(@Path() name: string, @Body() input: InputProductionStatsRequest) {
    return findOptimalSetsForMeal(name, this.#parseInputProductionStatsRequest(input));
  }

  #parseInputProductionStatsRequest(input: InputProductionStatsRequest): InputProductionStats {
    const level = input.level ?? 60;
    const subskillNames = input.subskills ?? [INGREDIENT_FINDER_M.name, HELPING_SPEED_M.name, INVENTORY_L.name];

    return {
      level,
      nature: getNature(input.nature ?? RASH.name),
      subskills: extractSubskillsBasedOnLevel(level, subskillNames),
      berries: getBerriesForIsland(findIslandForName(input.island)),
      e4eProcs: input.e4e ?? 0,
      helpingBonus: input.helpingbonus ?? 0,
      goodCamp: input.camp ?? false,
    };
  }
}
