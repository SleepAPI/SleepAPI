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
import { Summary } from '@src/domain/event/events/summary-event/summary-event';
import { SleepInfo } from '@src/domain/sleep/sleep-info';
import { Time } from '@src/domain/time/time';
import { roundDown } from '@src/utils/calculator-utils/calculator-utils';
import {
  addSneakySnackEvent,
  helpEvent,
  inventoryFull,
  recoverEnergyEvents,
  recoverFromMeal,
} from '@src/utils/event-utils/event-utils';
import { addToInventory, countInventory, emptyInventory } from '@src/utils/inventory-utils/inventory-utils';
import { getEmptyProduce } from '@src/utils/production-utils/production-utils';
import { finishSimulation, startDayAndEnergy, startNight } from '@src/utils/simulation-utils/simulation-utils';
import {
  addTime,
  calculateDuration,
  isAfterOrEqualWithinPeriod,
  scheduleEnergyEvents,
  secondsToTime,
  timeWithinPeriod,
} from '@src/utils/time-utils/time-utils';
import { BerrySet } from 'sleepapi-common';
import { maybeDegradeEnergy } from '../calculator/energy/energy-calculator';
import { calculateFrequencyWithEnergy } from '../calculator/help/help-calculator';
import { combineSameIngredientsInDrop } from '../calculator/ingredient/ingredient-calculate';
import { clampHelp } from '../calculator/production/produce-calculator';
import { calculateSubskillCarrySize } from '../calculator/stats/stats-calculator';

/**
 * Runs the production simulation
 */
export function simulation(params: {
  dayInfo: SleepInfo;
  input: ProductionStats;
  helpFrequency: number;
  pokemonWithAverageProduce: PokemonProduce;
  sneakySnackBerries: BerrySet;
  recoveryEvents: EnergyEvent[];
  mealTimes?: Time[];
}): { detailedProduce: DetailedProduce; log: ScheduledEvent[] } {
  // Set up input
  const { dayInfo, input, helpFrequency, pokemonWithAverageProduce, sneakySnackBerries, recoveryEvents, mealTimes } =
    params;
  const sneakySnackProduce: Produce = { berries: sneakySnackBerries, ingredients: [] };
  const { pokemon, produce: averageProduce } = pokemonWithAverageProduce;
  const averageProduceAmount = countInventory(averageProduce);
  const inventoryLimit = pokemon.maxCarrySize + calculateSubskillCarrySize(input.subskills ?? []);

  // summary values
  let helpsBeforeSS = 0;
  let helpsAfterSS = 0;
  let collectFrequency = undefined;
  let totalRecovery = 0;
  const energyIntervals: number[] = [];
  const frequencyIntervals: number[] = [];

  // Set up start values
  const eventLog: ScheduledEvent[] = [];
  const startingEnergy = startDayAndEnergy(dayInfo, pokemon, input, recoveryEvents, eventLog);

  let totalProduce: Produce = getEmptyProduce(pokemon.berry);
  let spilledIngredients: Produce = getEmptyProduce(pokemon.berry);
  let totalSneakySnack: Produce = getEmptyProduce(pokemon.berry);

  let currentEnergy = startingEnergy;
  let currentInventory: Produce = getEmptyProduce(pokemon.berry);

  let nextHelpEvent: Time = dayInfo.period.start;

  const energyEvents: EnergyEvent[] = scheduleEnergyEvents(dayInfo.period, recoveryEvents);

  let currentTime = dayInfo.period.start;
  let chunksOf5Minutes = 0;

  // --- DAY ---
  let period = dayInfo.period;
  while (timeWithinPeriod(currentTime, period)) {
    const mealRecovery = recoverFromMeal({ currentEnergy, currentTime, period, eventLog, mealTimes });
    const eventRecovery = recoverEnergyEvents({ energyEvents, currentTime, currentEnergy, period, eventLog });
    currentEnergy += mealRecovery + eventRecovery;
    totalRecovery += mealRecovery + eventRecovery;

    // check if help has occured
    if (isAfterOrEqualWithinPeriod({ currentTime, eventTime: nextHelpEvent, period })) {
      if (inventoryFull({ currentInventory, averageProduceAmount, inventoryLimit, currentTime, eventLog })) {
        if (!collectFrequency) {
          collectFrequency = calculateDuration({ start: period.start, end: nextHelpEvent });
        }
        totalProduce = addToInventory(totalProduce, currentInventory);
        currentInventory = emptyInventory(currentInventory);
      }

      const frequency = calculateFrequencyWithEnergy(helpFrequency, currentEnergy);
      const nextHelp = addTime(nextHelpEvent, secondsToTime(frequency));
      helpEvent({
        time: nextHelpEvent,
        frequency,
        produce: averageProduce,
        amount: averageProduceAmount,
        currentInventory,
        inventoryLimit,
        nextHelp,
        eventLog,
      });
      ++helpsBeforeSS;
      frequencyIntervals.push(frequency);

      currentInventory = addToInventory(currentInventory, averageProduce);
      nextHelpEvent = nextHelp;
    }

    currentEnergy = roundDown(
      currentEnergy -
        maybeDegradeEnergy({
          timeToDegrade: chunksOf5Minutes++ % 2 === 0 && chunksOf5Minutes >= 2,
          currentTime,
          currentEnergy,
          eventLog,
        }),
      2
    );

    energyIntervals.push(currentEnergy);

    currentTime = addTime(currentTime, { hour: 0, minute: 5, second: 0 });
  }

  // --- NIGHT ---
  startNight({ period, currentInventory, inventoryLimit, eventLog });
  totalProduce = addToInventory(totalProduce, currentInventory);
  currentInventory = emptyInventory(currentInventory);

  period = { start: dayInfo.period.end, end: dayInfo.period.start };

  while (timeWithinPeriod(currentTime, period)) {
    if (isAfterOrEqualWithinPeriod({ currentTime, eventTime: nextHelpEvent, period })) {
      const frequency = calculateFrequencyWithEnergy(helpFrequency, currentEnergy);
      const nextHelp = addTime(nextHelpEvent, secondsToTime(frequency));

      if (countInventory(currentInventory) >= inventoryLimit) {
        // sneaky snacking
        const spilledProduce: Produce = {
          berries: { amount: 0, berry: averageProduce.berries.berry },
          ingredients: averageProduce.ingredients,
        };

        addSneakySnackEvent({
          currentTime,
          frequency,
          sneakySnackProduce,
          totalSneakySnack,
          spilledProduce,
          totalSpilledIngredients: spilledIngredients,
          nextHelp,
          eventLog,
        });
        ++helpsAfterSS;

        spilledIngredients = addToInventory(spilledIngredients, averageProduce);
        totalSneakySnack = addToInventory(totalSneakySnack, sneakySnackProduce);
      } else if (countInventory(currentInventory) + averageProduceAmount >= inventoryLimit) {
        // next help starts sneaky snacking
        const inventorySpace = inventoryLimit - countInventory(currentInventory);
        const clampedProduce = clampHelp({ inventorySpace, averageProduce, amount: averageProduceAmount });
        const voidProduce = clampHelp({
          inventorySpace: averageProduceAmount - inventorySpace,
          averageProduce,
          amount: averageProduceAmount,
        });

        helpEvent({
          time: nextHelpEvent,
          frequency,
          produce: clampedProduce,
          amount: inventorySpace,
          currentInventory,
          inventoryLimit,
          nextHelp,
          eventLog,
        });
        ++helpsBeforeSS;

        currentInventory = addToInventory(currentInventory, clampedProduce);
        spilledIngredients = addToInventory(spilledIngredients, voidProduce);
      } else {
        // not yet reached inventory limit
        helpEvent({
          time: nextHelpEvent,
          frequency,
          produce: averageProduce,
          amount: averageProduceAmount,
          currentInventory,
          inventoryLimit,
          nextHelp,
          eventLog,
        });
        ++helpsBeforeSS;

        currentInventory = addToInventory(currentInventory, averageProduce);
      }

      frequencyIntervals.push(frequency);
      nextHelpEvent = nextHelp;
    }

    currentEnergy = roundDown(
      currentEnergy -
        maybeDegradeEnergy({
          timeToDegrade: chunksOf5Minutes++ % 2 === 0,
          currentTime,
          currentEnergy,
          eventLog,
        }),
      2
    );

    energyIntervals.push(currentEnergy);
    currentTime = addTime(currentTime, { hour: 0, minute: 5, second: 0 });
  }

  totalProduce = addToInventory(totalProduce, currentInventory);
  totalProduce = addToInventory(totalProduce, totalSneakySnack);
  const summary: Summary = {
    nrOfHelps: helpsBeforeSS + helpsAfterSS,
    helpsBeforeSS,
    helpsAfterSS,
    totalProduce,
    averageEnergy: energyIntervals.reduce((sum, cur) => sum + cur, 0) / energyIntervals.length,
    averageFrequency: frequencyIntervals.reduce((sum, cur) => sum + cur, 0) / frequencyIntervals.length,
    spilledIngredients: spilledIngredients.ingredients,
    collectFrequency,
    totalRecovery,
  };
  finishSimulation({ period, currentInventory, totalSneakySnack, inventoryLimit, summary, eventLog });

  return {
    detailedProduce: {
      produce: {
        berries: totalProduce.berries,
        ingredients: combineSameIngredientsInDrop(totalProduce.ingredients),
      },
      spilledIngredients: combineSameIngredientsInDrop(spilledIngredients.ingredients),
      sneakySnack: totalSneakySnack.berries,
    },
    log: eventLog,
  };
}
