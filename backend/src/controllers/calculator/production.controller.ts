import { ProductionStats } from '@src/domain/computed/production';
import { SleepAPIError } from '@src/domain/error/sleepapi-error';
import { ProductionRequest } from '@src/routes/calculator-router/production-router';
import { calculatePokemonProduction } from '@src/services/api-service/production/production-service';
import { getNature } from '@src/utils/nature-utils/nature-utils';
import { getPokemon } from '@src/utils/pokemon-utils/pokemon-utils';
import { queryAsBoolean, queryAsNumber } from '@src/utils/routing/routing-utils';
import { extractSubskillsBasedOnLevel } from '@src/utils/subskill-utils/subskill-utils';
import { calculateDuration, parseTime } from '@src/utils/time-utils/time-utils';
import { pokemon } from 'sleepapi-common';
import { Body, Controller, Path, Post, Route, Tags } from 'tsoa';

@Route('api/calculator')
@Tags('calculator')
export default class ProductionController extends Controller {
  @Post('production/{name}')
  public async calculatePokemonProduction(@Path() name: string, @Body() body: ProductionRequest) {
    const pokemon = getPokemon(name);
    return calculatePokemonProduction(pokemon, this.#parseInput(pokemon, body), body.ingredientSet, 5000);
  }

  #parseInput(pokemon: pokemon.Pokemon, input: ProductionRequest): ProductionStats {
    const level = queryAsNumber(input.level) ?? 60;
    const mainBedtime = parseTime(input.mainBedtime);
    const mainWakeup = parseTime(input.mainWakeup);
    const duration = calculateDuration({ start: mainBedtime, end: mainWakeup });
    if (duration.hour < 1) {
      throw new SleepAPIError('Minimum sleep of 1 hour required');
    }
    const parsedInput: ProductionStats = {
      level,
      nature: getNature(input.nature),
      subskills: extractSubskillsBasedOnLevel(level, input.subskills),
      skillLevel: Math.min(queryAsNumber(input.skillLevel) ?? pokemon.skill.maxLevel, pokemon.skill.maxLevel),
      e4e: queryAsNumber(input.e4e) ?? 0,
      cheer: queryAsNumber(input.cheer) ?? 0,
      extraHelpful: queryAsNumber(input.extraHelpful) ?? 0,
      helpingBonus: queryAsNumber(input.helpingbonus) ?? 0,
      camp: queryAsBoolean(input.camp),
      erb: queryAsNumber(input.erb) ?? 0,
      incense: queryAsBoolean(input.recoveryIncense),
      mainBedtime,
      mainWakeup,
    };
    return parsedInput;
  }
}
