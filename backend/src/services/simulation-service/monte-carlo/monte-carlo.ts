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

import { EnergyEvent } from '@src/domain/event/events/energy-event/energy-event';
import { SleepInfo } from '@src/domain/sleep/sleep-info';
import { Time } from '@src/domain/time/time';
import { pokemon } from 'sleepapi-common';
import { randomizedSimulation } from './randomized-simulator';

export interface MonteCarloResult {
  skillProcsDay: number;
  skillProcsNight: number;
  dayHelps: number;
  nightHelps: number;
  endingEnergy: number;
}

export function monteCarlo(params: {
  dayInfo: SleepInfo;
  helpFrequency: number;
  skillPercentage: number;
  skillLevel: number;
  pokemon: pokemon.Pokemon;
  recoveryEvents: EnergyEvent[];
  mealTimes: Time[];
  monteCarloIterations: number;
}) {
  const {
    dayInfo,
    helpFrequency,
    skillPercentage,
    skillLevel,
    pokemon,
    recoveryEvents,
    mealTimes,
    monteCarloIterations,
  } = params;

  const results: MonteCarloResult[] = [];
  let energyFromYesterday = 0;
  let nightHelpsFromYesterday = 0;
  for (let i = 0; i < monteCarloIterations; i++) {
    const simResult = randomizedSimulation({
      dayInfo,
      helpFrequency,
      skillPercentage,
      skillLevel,
      pokemon,
      recoveryEvents,
      mealTimes,
      energyFromYesterday,
      nightHelpsFromYesterday,
    });
    const { endingEnergy, nightHelps } = simResult;

    energyFromYesterday = endingEnergy;
    nightHelpsFromYesterday = nightHelps;

    results.push(simResult);
  }

  const averageDailySkillProcs = results.reduce((sum, cur) => sum + cur.skillProcsDay, 0) / results.length;
  const averageNightlySkillProcOdds = results.reduce((sum, cur) => sum + cur.skillProcsNight, 0) / results.length;
  const dayHelps = results.reduce((sum, cur) => sum + cur.dayHelps, 0) / results.length;

  return { averageDailySkillProcs, averageNightlySkillProcOdds, dayHelps };
}
