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

import { PokemonProduce } from '@src/domain/combination/produce';
import { ScheduledEvent } from '@src/domain/event/event';
import { EnergyEvent } from '@src/domain/event/events/energy-event/energy-event';
import { SleepInfo } from '@src/domain/sleep/sleep-info';
import { recoverEnergyEvents, recoverFromMeal } from '@src/utils/event-utils/event-utils';
import { InventoryUtils } from '@src/utils/inventory-utils/inventory-utils';
import { TimeUtils } from '@src/utils/time-utils/time-utils';
import { MathUtils, Produce, Time, mainskill } from 'sleepapi-common';
import { calculateSleepEnergyRecovery, maybeDegradeEnergy } from '../../calculator/energy/energy-calculator';
import { calculateFrequencyWithEnergy } from '../../calculator/help/help-calculator';
import { MonteCarloResult } from './monte-carlo';

/**
 * Runs the randomized simulation for Monte Carlo
 */
export function randomizedSimulation(params: {
  dayInfo: SleepInfo;
  helpFrequency: number;
  skillPercentage: number;
  skillLevel: number;
  pokemonWithAverageProduce: PokemonProduce;
  inventoryLimit: number;
  recoveryEvents: EnergyEvent[];
  mealTimes: Time[];
  energyFromYesterday: number;
  nightHelpsBeforeCarryFromYesterday: number;
}): MonteCarloResult {
  // Set up input
  const {
    dayInfo,
    helpFrequency,
    skillPercentage,
    skillLevel,
    pokemonWithAverageProduce,
    inventoryLimit,
    recoveryEvents,
    mealTimes,
    energyFromYesterday,
    nightHelpsBeforeCarryFromYesterday,
  } = params;
  const nature = dayInfo.nature;
  const { pokemon, produce: averageProduce } = pokemonWithAverageProduce;

  // TODO: only needed before refactor
  const eventLog: ScheduledEvent[] = [];
  let currentInventory: Produce = {
    ingredients: [],
    berries: {
      amount: 0,
      berry: pokemonWithAverageProduce.pokemon.berry,
    },
  };

  // summary values
  let skillProcsDay = 0;
  let skillProcsNight = 0;
  let dayHelps = 0;
  let nightHelpsBeforeSS = 0;

  // event array indices
  let energyIndex = 0;
  let mealIndex = 0;

  // Set up start values
  let currentEnergy = Math.min(
    calculateSleepEnergyRecovery({ ...dayInfo, period: { start: dayInfo.period.end, end: dayInfo.period.start } }) +
      energyFromYesterday,
    100
  );

  let nextHelpEvent: Time = dayInfo.period.start;

  const energyEvents: EnergyEvent[] = TimeUtils.sortEventsForPeriod(dayInfo.period, recoveryEvents);

  let currentTime = dayInfo.period.start;
  let chunksOf5Minutes = 0;

  // check skill procs at night
  for (let i = 0; i < nightHelpsBeforeCarryFromYesterday; i++) {
    const skillActivated = MathUtils.rollRandomChance(skillPercentage);
    if (skillActivated) {
      if (pokemon.skill.unit === 'energy') {
        let energyAmount = pokemon.skill.amount[skillLevel - 1] * nature.energy;
        if (pokemon.skill === mainskill.ENERGIZING_CHEER_S) {
          // 20% chance it affects this Pokémon
          if (!MathUtils.rollRandomChance(0.2)) {
            energyAmount = 0;
          }
        }
        currentEnergy = Math.min(currentEnergy + energyAmount, 150);
      }
      skillProcsNight += 1;
      if (skillProcsNight === 2 || pokemon.specialty !== 'skill') {
        break;
      }
    }
  }

  // --- DAY ---
  let period = dayInfo.period;
  while (TimeUtils.timeWithinPeriod(currentTime, period)) {
    const { recoveredAmount: mealRecovery, mealsProcessed } = recoverFromMeal({
      currentEnergy,
      currentTime,
      period,
      eventLog,
      mealTimes,
      mealIndex,
    });
    const { recoveredEnergy: eventRecovery, energyEventsProcessed } = recoverEnergyEvents({
      energyEvents,
      energyIndex,
      currentTime,
      currentEnergy,
      period,
      eventLog,
    });

    mealIndex = mealsProcessed;
    energyIndex = energyEventsProcessed;

    // check if help has occured
    if (TimeUtils.isAfterOrEqualWithinPeriod({ currentTime, eventTime: nextHelpEvent, period })) {
      const frequency = calculateFrequencyWithEnergy(helpFrequency, currentEnergy);
      const nextHelp = TimeUtils.addTime(nextHelpEvent, TimeUtils.secondsToTime(frequency));

      if (MathUtils.rollRandomChance(skillPercentage)) {
        skillProcsDay += 1;
        if (pokemon.skill.unit === 'energy') {
          let energyAmount = pokemon.skill.amount[skillLevel - 1] * nature.energy;
          if (pokemon.skill === mainskill.ENERGIZING_CHEER_S) {
            // 20% chance it affects this Pokémon
            if (!MathUtils.rollRandomChance(0.2)) {
              energyAmount = 0;
            }
          }
          currentEnergy = Math.min(currentEnergy + energyAmount, 150);
        }
      }

      ++dayHelps;
      nextHelpEvent = nextHelp;
    }

    currentEnergy += mealRecovery + eventRecovery;

    currentEnergy = MathUtils.round(
      currentEnergy -
        maybeDegradeEnergy({
          timeToDegrade: chunksOf5Minutes++ % 2 === 0 && chunksOf5Minutes >= 2,
          currentTime,
          currentEnergy,
          eventLog,
        }),
      2
    );

    currentTime = TimeUtils.addTime(currentTime, { hour: 0, minute: 5, second: 0 });
  }

  // --- NIGHT ---
  period = { start: dayInfo.period.end, end: dayInfo.period.start };
  while (TimeUtils.timeWithinPeriod(currentTime, period)) {
    // only process helps if it fits in carry, not interested in total produce here
    if (
      InventoryUtils.countInventory(currentInventory) < inventoryLimit &&
      TimeUtils.isAfterOrEqualWithinPeriod({ currentTime, eventTime: nextHelpEvent, period })
    ) {
      const frequency = calculateFrequencyWithEnergy(helpFrequency, currentEnergy);
      const nextHelp = TimeUtils.addTime(nextHelpEvent, TimeUtils.secondsToTime(frequency));

      currentInventory = InventoryUtils.addToInventory(currentInventory, averageProduce);

      ++nightHelpsBeforeSS;
      nextHelpEvent = nextHelp;
    }

    currentEnergy = MathUtils.round(
      currentEnergy -
        maybeDegradeEnergy({
          timeToDegrade: chunksOf5Minutes++ % 2 === 0,
          currentTime,
          currentEnergy,
          eventLog,
        }),
      2
    );

    currentTime = TimeUtils.addTime(currentTime, { hour: 0, minute: 5, second: 0 });
  }

  return {
    dayHelps,
    nightHelpsBeforeSS,
    skillProcsDay,
    skillProcsNight,
    endingEnergy: currentEnergy,
  };
}
