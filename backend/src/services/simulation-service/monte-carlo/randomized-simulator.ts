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

import { ScheduledEvent } from '@src/domain/event/event';
import { EnergyEvent } from '@src/domain/event/events/energy-event/energy-event';
import { SleepInfo } from '@src/domain/sleep/sleep-info';
import { Time } from '@src/domain/time/time';
import { roundDown } from '@src/utils/calculator-utils/calculator-utils';
import { recoverEnergyEvents, recoverFromMeal } from '@src/utils/event-utils/event-utils';
import {
  addTime,
  isAfterOrEqualWithinPeriod,
  scheduleEnergyEvents,
  secondsToTime,
  timeWithinPeriod,
} from '@src/utils/time-utils/time-utils';
import { pokemon } from 'sleepapi-common';
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
  pokemon: pokemon.Pokemon;
  recoveryEvents: EnergyEvent[];
  mealTimes: Time[];
  energyFromYesterday: number;
  nightHelpsFromYesterday: number;
}): MonteCarloResult {
  // Set up input
  const {
    dayInfo,
    helpFrequency,
    skillPercentage,
    skillLevel,
    pokemon,
    recoveryEvents,
    mealTimes,
    energyFromYesterday,
    nightHelpsFromYesterday,
  } = params;
  const nature = dayInfo.nature;

  // TODO: only needed before refactor
  const eventLog: ScheduledEvent[] = [];

  // summary values
  let skillProcsDay = 0;
  let skillProcsNight = 0;
  let dayHelps = 0;
  let nightHelps = 0;

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

  const energyEvents: EnergyEvent[] = scheduleEnergyEvents(dayInfo.period, recoveryEvents);

  let currentTime = dayInfo.period.start;
  let chunksOf5Minutes = 0;

  // check if we proc'd skill at night
  for (let i = 0; i < nightHelpsFromYesterday; i++) {
    const skillActivated = rollForSkillProc(skillPercentage);
    if (skillActivated) {
      if (pokemon.skill.unit === 'energy') {
        currentEnergy += pokemon.skill.amount[skillLevel - 1] * nature.energy;
      }
      skillProcsNight += 1;
      break;
    }
  }

  // --- DAY ---
  let period = dayInfo.period;
  while (timeWithinPeriod(currentTime, period)) {
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
    if (isAfterOrEqualWithinPeriod({ currentTime, eventTime: nextHelpEvent, period })) {
      const frequency = calculateFrequencyWithEnergy(helpFrequency, currentEnergy);
      const nextHelp = addTime(nextHelpEvent, secondsToTime(frequency));
      let skillRecovery = 0;

      if (rollForSkillProc(skillPercentage)) {
        skillProcsDay += 1;
        if (pokemon.skill.unit === 'energy') {
          skillRecovery = pokemon.skill.amount[skillLevel - 1] * nature.energy;
        }
      }

      currentEnergy += mealRecovery + eventRecovery + skillRecovery;

      ++dayHelps;
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

    currentTime = addTime(currentTime, { hour: 0, minute: 5, second: 0 });
  }

  // --- NIGHT ---
  period = { start: dayInfo.period.end, end: dayInfo.period.start };
  while (timeWithinPeriod(currentTime, period)) {
    // check if help has occured
    if (isAfterOrEqualWithinPeriod({ currentTime, eventTime: nextHelpEvent, period })) {
      const frequency = calculateFrequencyWithEnergy(helpFrequency, currentEnergy);
      const nextHelp = addTime(nextHelpEvent, secondsToTime(frequency));

      ++nightHelps;
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

    currentTime = addTime(currentTime, { hour: 0, minute: 5, second: 0 });
  }

  return {
    dayHelps,
    nightHelps,
    skillProcsDay,
    skillProcsNight,
    endingEnergy: currentEnergy,
  };
}

function rollForSkillProc(percentage: number): boolean {
  const roll = Math.random();
  return roll < percentage;
}
