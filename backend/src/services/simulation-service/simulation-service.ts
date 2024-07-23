/**
 * Copyright 2024 Sleep API Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DetailedProduce, PokemonProduce, Produce } from '@src/domain/combination/produce';
import { ProductionStats } from '@src/domain/computed/production';
import { ScheduledEvent } from '@src/domain/event/event';
import { EnergyEvent } from '@src/domain/event/events/energy-event/energy-event';
import { SkillActivation } from '@src/domain/event/events/skill-event/skill-event';
import { Summary } from '@src/domain/event/events/summary-event/summary-event';
import { SleepInfo } from '@src/domain/sleep/sleep-info';
import { Time } from '@src/domain/time/time';
import {
  getDefaultRecoveryEvents,
  getExtraHelpfulEvents,
  getHelperBoostEvents,
} from '@src/utils/event-utils/event-utils';
import { getDefaultMealTimes } from '@src/utils/meal-utils/meal-utils';
import {
  BerrySet,
  MEALS_IN_DAY,
  PokemonIngredientSet,
  calculateIngredientPercentage,
  calculateNrOfBerriesPerDrop,
  calculateSkillPercentage,
  combineSameIngredientsInDrop,
  mainskill,
  maxCarrySize,
  nature,
} from 'sleepapi-common';
import { calculateHelpSpeedBeforeEnergy } from '../calculator/help/help-calculator';
import { calculateAveragePokemonIngredientSet } from '../calculator/ingredient/ingredient-calculate';
import { calculateAverageProduce } from '../calculator/production/produce-calculator';
import {
  calculateOddsAtLeastOneSkillProc,
  calculateSkillProcs,
  scheduleSkillEvents,
} from '../calculator/skill/skill-calculator';
import { calculateSubskillCarrySize, countErbUsers } from '../calculator/stats/stats-calculator';
import { monteCarlo } from './monte-carlo/monte-carlo';
import { simulation } from './simulator/simulator';

/**
 * Sets up all the simulation input and runs the simulated production window
 */
export function setupAndRunProductionSimulation(params: {
  pokemonCombination: PokemonIngredientSet;
  input: ProductionStats;
  monteCarloIterations: number;
  preGeneratedSkillActivations?: SkillActivation[];
}): {
  detailedProduce: DetailedProduce;
  skillActivations: SkillActivation[];
  averageProduce: Produce;
  log: ScheduledEvent[];
  summary: Summary;
} {
  const { pokemonCombination, input, monteCarloIterations, preGeneratedSkillActivations } = params;
  const {
    level,
    nature: maybeNature = nature.BASHFUL,
    subskills = [],
    e4eProcs,
    e4eLevel,
    cheer,
    extraHelpful,
    helperBoostProcs,
    helperBoostUnique,
    helperBoostLevel,
    helpingBonus,
    camp,
    erb,
    incense,
    mainBedtime,
    mainWakeup,
  } = input;

  const averagedPokemonCombination = calculateAveragePokemonIngredientSet(pokemonCombination);

  const ingredientPercentage = calculateIngredientPercentage({
    pokemon: pokemonCombination.pokemon,
    nature: maybeNature,
    subskills,
  });
  const skillPercentage = calculateSkillPercentage(pokemonCombination.pokemon, subskills, maybeNature);

  const daySleepInfo: SleepInfo = {
    period: { end: mainBedtime, start: mainWakeup },
    nature: maybeNature,
    incense,
    erb: countErbUsers(erb, subskills),
  };

  const mealTimes = getDefaultMealTimes(daySleepInfo.period);

  const berriesPerDrop = calculateNrOfBerriesPerDrop(averagedPokemonCombination.pokemon, subskills);
  const sneakySnackBerries: BerrySet = {
    amount: berriesPerDrop,
    berry: averagedPokemonCombination.pokemon.berry,
  };

  const inventoryLimit =
    (input.inventoryLimit ?? maxCarrySize(averagedPokemonCombination.pokemon)) +
    calculateSubskillCarrySize(input.subskills ?? []);

  const pokemonWithAverageProduce: PokemonProduce = {
    pokemon: averagedPokemonCombination.pokemon,
    produce: calculateAverageProduce(averagedPokemonCombination, ingredientPercentage, berriesPerDrop),
  };

  const helpFrequency = calculateHelpSpeedBeforeEnergy({
    pokemon: averagedPokemonCombination.pokemon,
    level,
    nature: maybeNature,
    subskills,
    camp,
    helpingBonus,
  });

  const recoveryEvents = getDefaultRecoveryEvents(daySleepInfo.period, maybeNature, e4eProcs, e4eLevel, cheer);
  const extraHelpfulEvents = getExtraHelpfulEvents(daySleepInfo.period, extraHelpful, pokemonWithAverageProduce);
  const helperBoostEvents = getHelperBoostEvents(
    daySleepInfo.period,
    helperBoostProcs,
    helperBoostUnique,
    helperBoostLevel,
    pokemonWithAverageProduce
  );

  const skillActivations = preGeneratedSkillActivations
    ? preGeneratedSkillActivations
    : generateSkillActivations({
        dayInfo: daySleepInfo,
        helpFrequency,
        skillPercentage,
        input,
        pokemonWithAverageProduce,
        inventoryLimit,
        sneakySnackBerries,
        recoveryEvents,
        mealTimes,
        monteCarloIterations,
      });

  const { detailedProduce, log, summary } = simulation({
    dayInfo: daySleepInfo,
    input,
    helpFrequency,
    pokemonWithAverageProduce,
    inventoryLimit,
    sneakySnackBerries,
    recoveryEvents,
    extraHelpfulEvents,
    helperBoostEvents,
    skillActivations,
    mealTimes,
  });

  return {
    detailedProduce: {
      ...detailedProduce,
      produce: {
        berries: detailedProduce.produce.berries && {
          amount: detailedProduce.produce.berries.amount,
          berry: detailedProduce.produce.berries.berry,
        },
        ingredients: detailedProduce.produce.ingredients.map(({ amount, ingredient }) => ({
          amount: amount / MEALS_IN_DAY,
          ingredient: ingredient,
        })),
      },
    },
    averageProduce: {
      berries: pokemonWithAverageProduce.produce.berries,
      ingredients: combineSameIngredientsInDrop(pokemonWithAverageProduce.produce.ingredients),
    },
    skillActivations,
    log,
    summary,
  };
}

export function generateSkillActivations(params: {
  dayInfo: SleepInfo;
  helpFrequency: number;
  skillPercentage: number;
  recoveryEvents: EnergyEvent[];
  mealTimes: Time[];
  input: ProductionStats;
  pokemonWithAverageProduce: PokemonProduce;
  inventoryLimit: number;
  sneakySnackBerries: BerrySet;
  monteCarloIterations: number;
}) {
  const {
    dayInfo,
    helpFrequency,
    skillPercentage,
    recoveryEvents,
    mealTimes,
    input,
    pokemonWithAverageProduce,
    inventoryLimit,
    sneakySnackBerries,
    monteCarloIterations,
  } = params;
  const skillLevel = input.skillLevel ?? pokemonWithAverageProduce.pokemon.skill.maxLevel;

  let oddsOfNightSkillProc = 0;
  let nrOfDaySkillProcs = 0;
  let nrOfDayHelps = 0;

  // run Monte Carlo simulation to estimate skill activations
  if (
    pokemonWithAverageProduce.pokemon.skill.unit === 'energy' ||
    pokemonWithAverageProduce.pokemon.skill === mainskill.METRONOME
  ) {
    const { averageDailySkillProcs, averageNightlySkillProcOdds, dayHelps } = monteCarlo({
      dayInfo,
      helpFrequency,
      skillPercentage,
      skillLevel,
      pokemonWithAverageProduce,
      inventoryLimit,
      recoveryEvents,
      mealTimes,
      monteCarloIterations,
    });
    nrOfDaySkillProcs = averageDailySkillProcs;
    oddsOfNightSkillProc = averageNightlySkillProcOdds;
    nrOfDayHelps = dayHelps;
  } else {
    const { detailedProduce } = simulation({
      dayInfo,
      input,
      helpFrequency,
      pokemonWithAverageProduce,
      inventoryLimit,
      sneakySnackBerries,
      recoveryEvents,
      extraHelpfulEvents: [],
      helperBoostEvents: [],
      skillActivations: [],
      mealTimes,
    });
    const { dayHelps, nightHelpsBeforeSS } = detailedProduce;
    nrOfDaySkillProcs = calculateSkillProcs(dayHelps ?? 0, skillPercentage);
    oddsOfNightSkillProc = calculateOddsAtLeastOneSkillProc({ skillPercentage, helps: nightHelpsBeforeSS });
    nrOfDayHelps = dayHelps;
  }

  return scheduleSkillEvents({
    skillLevel,
    pokemonWithAverageProduce,
    oddsOfNightSkillProc,
    nrOfDaySkillProcs,
    nrOfDayHelps,
    uniqueHelperBoost: input.helperBoostUnique,
  });
}
