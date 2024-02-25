import { ProductionStats } from '@src/domain/computed/production';
import { ProductionRequest } from '@src/routes/calculator-router/production-router';
import { calculatePokemonProduction } from '@src/services/api-service/production/production-service';
import { getNature } from '@src/utils/nature-utils/nature-utils';
import { queryAsBoolean, queryAsNumber } from '@src/utils/routing/routing-utils';
import { extractSubskillsBasedOnLevel } from '@src/utils/subskill-utils/subskill-utils';
import { parseTime } from '@src/utils/time-utils/time-utils';
import { Body, Controller, Path, Post, Route, Tags } from 'tsoa';

@Route('api/calculator')
@Tags('calculator')
export default class ProductionController extends Controller {
  @Post('production/{name}')
  public async calculatePokemonProduction(@Path() name: string, @Body() body: ProductionRequest) {
    return calculatePokemonProduction(name, this.#parseInput(body), body.ingredientSet, 5000);
  }

  #parseInput(input: ProductionRequest): ProductionStats {
    const level = queryAsNumber(input.level) ?? 60;
    const parsedInput: ProductionStats = {
      level,
      nature: getNature(input.nature),
      subskills: extractSubskillsBasedOnLevel(level, input.subskills),
      e4e: queryAsNumber(input.e4e) ?? 0,
      cheer: queryAsNumber(input.cheer) ?? 0,
      helpingBonus: queryAsNumber(input.helpingbonus) ?? 0,
      camp: queryAsBoolean(input.camp),
      erb: queryAsNumber(input.erb) ?? 0,
      incense: queryAsBoolean(input.recoveryIncense),
      skillLevel: queryAsNumber(input.skillLevel) ?? 6,
      mainBedtime: parseTime(input.mainBedtime),
      mainWakeup: parseTime(input.mainWakeup),
    };
    return parsedInput;
  }
}
