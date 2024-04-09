import { ProductionStats } from '@src/domain/computed/production';
import { PokemonError } from '@src/domain/error/pokemon/pokemon-error';
import { SleepAPIError } from '@src/domain/error/sleepapi-error';
import { ProductionRequest } from '@src/routes/calculator-router/production-router';
import { calculatePokemonProduction } from '@src/services/api-service/production/production-service';
import { getNature } from '@src/utils/nature-utils/nature-utils';
import { getPokemon } from '@src/utils/pokemon-utils/pokemon-utils';
import { queryAsBoolean, queryAsNumber } from '@src/utils/routing/routing-utils';
import { extractSubskillsBasedOnLevel } from '@src/utils/subskill-utils/subskill-utils';
import { calculateDuration, parseTime } from '@src/utils/time-utils/time-utils';
import { mainskill, pokemon } from 'sleepapi-common';
import { Body, Controller, Path, Post, Query, Route, Tags } from 'tsoa';

@Route('api/calculator')
@Tags('calculator')
export default class ProductionController extends Controller {
  @Post('production/{name}')
  public async calculatePokemonProduction(
    @Path() name: string,
    @Body() body: ProductionRequest,
    @Query() pretty?: boolean
  ) {
    const pokemon = getPokemon(name);
    return calculatePokemonProduction(
      pokemon,
      this.#parseInput(pokemon, body),
      body.ingredientSet,
      queryAsBoolean(pretty),
      5000
    );
  }

  #parseInput(pkmn: pokemon.Pokemon, input: ProductionRequest): ProductionStats {
    const level = queryAsNumber(input.level) ?? 60;

    const mainBedtime = parseTime(input.mainBedtime);
    const mainWakeup = parseTime(input.mainWakeup);
    const duration = calculateDuration({ start: mainBedtime, end: mainWakeup });
    if (duration.hour < 1) {
      throw new SleepAPIError('Minimum sleep of 1 hour required');
    }

    const rawUniqueHelperBoost = queryAsNumber(input.helperBoostUnique) ?? 0;
    const canRollHelperBoost = pkmn.skill === mainskill.HELPER_BOOST || pkmn.skill === mainskill.METRONOME;
    const uniqueHelperBoost = rawUniqueHelperBoost === 0 && canRollHelperBoost ? 1 : rawUniqueHelperBoost;

    const inputNrOfEvos = queryAsNumber(input.nrOfEvolutions);
    const maxCarrySize = inputNrOfEvos !== undefined ? pkmn.carrySize + inputNrOfEvos * 5 : pkmn.maxCarrySize;
    if (maxCarrySize > pkmn.maxCarrySize) {
      throw new PokemonError(`${pkmn.name} doesn't evolve ${inputNrOfEvos} times`);
    }

    const parsedInput: ProductionStats = {
      level,
      nature: getNature(input.nature),
      subskills: extractSubskillsBasedOnLevel(level, input.subskills),
      skillLevel: Math.min(queryAsNumber(input.skillLevel) ?? pkmn.skill.maxLevel, pkmn.skill.maxLevel),
      maxCarrySize,
      e4eProcs: queryAsNumber(input.e4eProcs) ?? 0,
      e4eLevel: queryAsNumber(input.e4eLevel) ?? mainskill.ENERGY_FOR_EVERYONE.maxLevel,
      cheer: queryAsNumber(input.cheer) ?? 0,
      extraHelpful: queryAsNumber(input.extraHelpful) ?? 0,
      helperBoostProcs: queryAsNumber(input.helperBoostProcs) ?? 0,
      helperBoostUnique: uniqueHelperBoost,
      helperBoostLevel: queryAsNumber(input.helperBoostLevel) ?? mainskill.HELPER_BOOST.maxLevel,
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
