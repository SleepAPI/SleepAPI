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

/**
 * Awake energy for 15.5 hours, formula for natural decline:
 * (20/0.45 + 20/0.52 + 20/0.62 + 20/0.71 + 13/1.00)/(15.5 * 6) = 1.681
 */
export function calculateAwakeAverageEnergyCoefficient(e4eProcs?: number) {
  if (!e4eProcs) {
    // no procs
    return 1 / 1.681;
  } else if (e4eProcs === 1) {
    // one proc on wakeup
    return 1 / ((38 / 0.45 + 20 / 0.52 + 20 / 0.62 + 15 / 0.71) / (15.5 * 6));
  } else if (e4eProcs === 2) {
    // 1st proc on wakeup, 2nd proc 7 hours later
    return 1 / ((52 / 0.45 + 24 / 0.52 + 17 / 0.62) / (15.5 * 6));
  } else if (e4eProcs === 3) {
    // 1st proc on wake up, then 2 more procs with 5 hours between
    return 1 / ((70 / 0.45 + 23 / 0.52) / (15.5 * 6));
  } else if (e4eProcs === 4) {
    // 1st proc on wake up, then 3 more procs with 4 hours between
    return 1 / ((92 / 0.45 + 1 / 0.52) / (15.5 * 6));
  } else {
    return 0.45;
  }
}

export function calculateAsleepAverageEnergyCoefficient(frequency: number, e4eprocs?: number) {
  const endingEnergy = calculateEndingEnergyCoefficient(e4eprocs);
  const a = (5 * frequency) / 600;
  return 1 / (((51 - a) / 0.45 + a / endingEnergy) / (8.5 * 6));
}

export function calculateSpecificEnergyCoefficient(energyPercentage: number) {
  if (energyPercentage >= 81 && energyPercentage <= 150) {
    return 0.45;
  } else if (energyPercentage >= 61) {
    return 0.52;
  } else if (energyPercentage >= 41) {
    return 0.62;
  } else if (energyPercentage >= 21) {
    return 0.71;
  } else if (energyPercentage >= 0) {
    return 1;
  } else {
    throw new Error(`Energy has to be between 0 and 150, but was ${energyPercentage}`);
  }
}

/** values taken from ending bracket in calculateAwakeAverageEnergyCoefficient */
export function calculateEndingEnergyCoefficient(e4eProcs?: number): number {
  if (!e4eProcs) {
    return 1;
  } else if (e4eProcs === 1) {
    return 0.71;
  } else if (e4eProcs === 2) {
    return 0.62;
  } else if (e4eProcs === 3) {
    return 0.52;
  } else if (e4eProcs === 4) {
    return 0.52;
  } else {
    return 0.45;
  }
}

export function calculateAverageNaturalDeclineEnergyCoefficient(frequency: number) {
  const a = (5 * frequency) / 600;
  return 1 / (1.873 - (1.222 * a) / 144);
}
