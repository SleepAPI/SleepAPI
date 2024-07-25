import { TeamMember } from '@src/domain/combination/team';
import { ProductionStats } from '@src/domain/computed/production';
import { PokemonError } from '@src/domain/error/pokemon/pokemon-error';
import { SleepAPIError } from '@src/domain/error/sleepapi-error';
import { ProductionRequest } from '@src/routes/calculator-router/production-router';
import { calculatePokemonProduction, calculateTeam } from '@src/services/api-service/production/production-service';
import { calculateRibbonCarrySize, calculateSubskillCarrySize } from '@src/services/calculator/stats/stats-calculator';
import { queryAsBoolean, queryAsNumber } from '@src/utils/routing/routing-utils';
import { extractSubskillsBasedOnLevel } from '@src/utils/subskill-utils/subskill-utils';
import { TimeUtils } from '@src/utils/time-utils/time-utils';
import {
  CalculateTeamRequest,
  IngredientInstance,
  IngredientSet,
  getNature,
  getPokemon,
  getSubskill,
  mainskill,
  pokemon,
} from 'sleepapi-common';
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
    const parsedInput = this.#parseSingleProductionInput(pokemon, body);
    return calculatePokemonProduction(pokemon, parsedInput, body.ingredientSet, queryAsBoolean(pretty), 5000);
  }

  public async calculateTeam(body: CalculateTeamRequest) {
    const parsedInput = this.#parseTeamInput(body);
    return calculateTeam(parsedInput);
  }

  #parseTeamInput(body: CalculateTeamRequest) {
    const { settings, members } = body;
    const bedtime = TimeUtils.parseTime(settings.bedtime);
    const wakeup = TimeUtils.parseTime(settings.wakeup);
    const sleepDuration = TimeUtils.calculateDuration({ start: bedtime, end: wakeup });
    const dayDuration = TimeUtils.calculateDuration({ start: wakeup, end: bedtime });
    if (sleepDuration.hour < 1 || dayDuration.hour < 1) {
      throw new SleepAPIError('Minimum 1 hour of sleep and daytime required');
    }

    const parsedMembers: TeamMember[] = [];
    for (const member of members) {
      const pokemon = getPokemon(member.pokemon);
      const subskills = member.subskills
        .filter((subskill) => subskill.level <= member.level)
        .map((subskill) => getSubskill(subskill.subskill));

      parsedMembers.push({
        pokemonSet: {
          pokemon,
          ingredientList: this.#getIngredientSet({ pokemon, level: member.level, ingredients: member.ingredients }),
        },
        level: member.level,
        ribbon: member.ribbon,
        carrySize: member.carrySize + calculateSubskillCarrySize(subskills) + calculateRibbonCarrySize(member.ribbon),
        nature: getNature(member.nature),
        skillLevel: member.skillLevel,
        subskills,
        externalId: member.externalId,
      });
    }

    return {
      settings: {
        camp: queryAsBoolean(settings.camp),
        bedtime,
        wakeup,
      },
      members: parsedMembers,
    };
  }

  #getIngredientSet(params: {
    pokemon: pokemon.Pokemon;
    level: number;
    ingredients: IngredientInstance[];
  }): IngredientSet[] {
    const { pokemon, level, ingredients } = params;

    const ingredientSet: IngredientSet[] = [pokemon.ingredient0];

    const ingredient30 = pokemon.ingredient30.find(
      (ingList) =>
        ingList.ingredient.name.toLowerCase() === ingredients.find((ing) => ing.level === 30)?.ingredient.toLowerCase()
    );
    if (ingredient30 && level >= 30) {
      ingredientSet.push(ingredient30);
    }

    const ingredient60 = pokemon.ingredient60.find(
      (ingList) =>
        ingList.ingredient.name.toLowerCase() === ingredients.find((ing) => ing.level === 60)?.ingredient.toLowerCase()
    );
    if (ingredient60 && level >= 60) {
      ingredientSet.push(ingredient60);
    }

    return ingredientSet;
  }

  #parseSingleProductionInput(pkmn: pokemon.Pokemon, input: ProductionRequest): ProductionStats {
    const level = queryAsNumber(input.level) ?? 60;

    const mainBedtime = TimeUtils.parseTime(input.mainBedtime);
    const mainWakeup = TimeUtils.parseTime(input.mainWakeup);
    const duration = TimeUtils.calculateDuration({ start: mainBedtime, end: mainWakeup });
    if (duration.hour < 1) {
      throw new SleepAPIError('Minimum sleep of 1 hour required');
    }

    const rawUniqueHelperBoost = queryAsNumber(input.helperBoostUnique) ?? 0;
    const canRollHelperBoost = pkmn.skill === mainskill.HELPER_BOOST || pkmn.skill === mainskill.METRONOME;
    const uniqueHelperBoost = rawUniqueHelperBoost === 0 && canRollHelperBoost ? 1 : rawUniqueHelperBoost;

    const inputNrOfEvos = queryAsNumber(input.nrOfEvolutions);
    const nrOfEvos = inputNrOfEvos !== undefined ? inputNrOfEvos : pkmn.previousEvolutions;
    if (nrOfEvos > pkmn.previousEvolutions) {
      throw new PokemonError(`${pkmn.name} doesn't evolve ${inputNrOfEvos} times`);
    }
    const inventoryLimit = pkmn.carrySize + nrOfEvos * 5;

    const parsedInput: ProductionStats = {
      level,
      ribbon: queryAsNumber(input.ribbon) ?? 0,
      nature: getNature(input.nature),
      subskills: extractSubskillsBasedOnLevel(level, input.subskills),
      skillLevel: Math.min(queryAsNumber(input.skillLevel) ?? pkmn.skill.maxLevel, pkmn.skill.maxLevel),
      inventoryLimit,
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
