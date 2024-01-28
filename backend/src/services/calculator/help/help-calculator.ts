/**
 * Copyright 2023 Sleep API Authors
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

import { CustomStats } from '@src/domain/combination/custom';
import { roundDown } from '@src/utils/calculator-utils/calculator-utils';
import { pokemon } from 'sleepapi-common';
import {
  calculateAsleepAverageEnergyCoefficient,
  calculateAwakeAverageEnergyCoefficient,
} from '../energy/energy-calculator';
import { calculateHelpSpeedSubskills, invertNatureFrequecy } from '../stats/stats-calculator';

export function calculateHelpSpeed(stats: {
  pokemon: pokemon.Pokemon;
  customStats: CustomStats;
  energyPeriod: 'CUSTOM' | 'DAY' | 'NIGHT';
  nrOfHelpingBonus: number;
  goodCamp: boolean;
  e4eProcs: number;
}): number {
  const {
    pokemon,
    customStats,
    energyPeriod: dayOrNight,
    nrOfHelpingBonus,
    goodCamp: goodCampActive,
    e4eProcs,
  } = stats;

  const helpSpeedSubskills = calculateHelpSpeedSubskills(customStats.subskills, nrOfHelpingBonus);
  const levelFactor = 1 - 0.002 * (customStats.level - 1);
  const natureFreq = invertNatureFrequecy(customStats.nature);
  const campBonus = goodCampActive ? 1.2 : 1;

  const energyFactor =
    dayOrNight === 'DAY'
      ? calculateAwakeAverageEnergyCoefficient(e4eProcs)
      : calculateAsleepAverageEnergyCoefficient(e4eProcs);

  return Math.floor(
    (roundDown(natureFreq * helpSpeedSubskills * levelFactor, 4) * pokemon.frequency * energyFactor) / campBonus
  );
}
