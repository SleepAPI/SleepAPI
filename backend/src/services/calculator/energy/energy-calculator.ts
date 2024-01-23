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
 * Base energy decline formula for 15.5 hours:
 * (20/0.45 + 20/0.52 + 20/0.62 + 20/0.71 + 13/1.00)/(15.5 * 6) = 1.681
 *
 * Calculates a day from 6:00 AM to 9:30 PM and cooks meal as late as possible
 * We make breakfast at 11:59 AM, we use 36% energy in the morning
 * We make lunch at 5:59 PM, we use 36% energy in the day
 * We make dinner at 9:29 PM, we use 21% energy in the evening
 * Note: if a e4e proc will push us an energy bracket higher we will cook the dish just before checking e4e
 *
 * When recovering dish energy we recover according to:
 * 100%+ -> +0 energy
 * 80%+ -> +1 energy
 * 60%+ -> +2 energy
 * 40%+ -> +3 energy
 * 20%+ -> +4 energy
 * 0%+ -> +5 energy
 */
export function calculateAwakeAverageEnergyCoefficient(e4eProcs?: number) {
  if (!e4eProcs) {
    // no procs
    // (20 / 0.45 + 16 / 0.52 + 6 / 0.52 + 20 / 0.62 + 10 / 0.71 + 14 / 0.71 + 7 / 1)/(15.5 * 6)
    // Energy at bedtime: 18%

    // --- Details ---
    // Morning: we spend 20% energy at 0.45, then 16% at 0.52, then eat and recover 2 energy
    // result: 20/0.45 + 16 / 0.52, ending at 66% (64% + 2 dish recovery)
    //
    // Day: we spend the last 6% at 0.52, then 20% at 0.62, then 10% at 0.71 and recover 4 energy
    // result: 6 / 0.52 + 20 / 0.62 + 10 / 0.71, ending at 34% (30% + 4 dish recovery)
    //
    // Night: we spend the last 14% at 0.71, then 7% at 1 and recover 5 energy
    // result: 14 / 0.71 + 7 / 1, ending at 18% (13% + 5 dish recovery)
    const morning = 20 / 0.45 + 16 / 0.52;
    const day = 6 / 0.52 + 20 / 0.62 + 10 / 0.71;
    const evening = 14 / 0.71 + 7 / 1;

    const coeff = (morning + day + evening) / (15.5 * 6);
    return 1 / coeff;
  } else if (e4eProcs === 1) {
    // one proc on wakeup
    // (36 / 0.45 + 3 / 0.45 + 20 / 0.52 + 13 / 0.62 + 10 / 0.62 + 11 / 0.71)/(15.5 * 6)
    // Energy at bedtime: 33%

    // --- Details ---
    // Morning: we recover +18 from e4e, we spend 36% energy at 0.45, then eat and recover 1 energy
    // result: 36/0.45, ending at 83% (100+18-36 + 1 dish recovery)
    // Day: we spend the last 3% at 0.45, then 20% at 0.52, then 13% at 0.62 and recover 3 energy
    // result: 3 / 0.45 + 20 / 0.52 + 13 / 0.62, ending at 50% (47% + 3 dish recovery)
    // Night: we spend the last 10% at 0.62, then 11% at 0.71 and recover 4 energy
    // result: 10 / 0.62 + 11 / 0.71, ending at 33% (50 - 21 + 4 dish recovery)
    const morning = 36 / 0.45;
    const day = 3 / 0.45 + 20 / 0.52 + 13 / 0.62;
    const evening = 10 / 0.62 + 11 / 0.71;

    const coeff = (morning + day + evening) / (15.5 * 6);
    return 1 / coeff;
  } else if (e4eProcs === 2) {
    // 1st proc on wakeup, 2nd proc 7 hours later
    // (36 / 0.45 + 3 / 0.45 + 3 / 0.52 + 15 / 0.45 + 15 / 0.52 + 7 / 0.52 + 14 / 0.62)/(15.5 * 6)
    // Energy at bedtime: 49%

    // --- Details ---
    // Morning: we recover +18 from e4e, we spend 36% energy at 0.45, then eat and recover 1 energy
    // result: 36/0.45, ending at 83% (100+18-36 + 1 dish recovery)
    //
    // Day: we will proc our 2nd e4e in 1 hour which is 6% left to burn before
    //  we spend the last 3% at 0.45
    //  we spend 3% at 0.52 and recover 18 energy, landing at 95%
    //  we have 30% left to spend before evening
    //  we spend 15% at 0.45
    //  we spend 15% at 0.52 and recover 2 energy
    // result: 3 / 0.45 + 3 / 0.52 + 15 / 0.45 + 15 / 0.52, ending at 67% (65% + 2 dish recovery)
    //
    // Night: we spend the last 7% at 0.52, then 14% at 0.62 and recover 3 energy
    // result: 7 / 0.52 + 14 / 0.62, ending at 49% (67 - 21 + 3 dish recovery)
    const morning = 36 / 0.45;
    const day = 3 / 0.45 + 3 / 0.52 + 15 / 0.45 + 15 / 0.52;
    const evening = 7 / 0.52 + 14 / 0.62;

    const coeff = (morning + day + evening) / (15.5 * 6);
    return 1 / coeff;
  } else if (e4eProcs === 3) {
    // 1st proc on wake up, then 2 more procs with 5 hours between
    // (30/0.45 + 6 / 0.45 + 21 / 0.45 + 3 / 0.52 + 12 / 0.45 + 5 / 0.45 + 16 / 0.52)/(15.5 * 6)
    // Energy at bedtime: 66%

    // --- Details ---
    // Morning: we recover +18 from e4e, landing at 118%
    //  we will proc our 2nd e4e in 5 hours which is 30% left to burn
    //  we spend 30% energy at 0.45
    //  we cook breakfast and recover 1 energy
    //  we e4e proc to recover 18 energy, landing at (118 - 30 + 1 + 18) = 107%
    //  we spend the final 6% at 0.45
    // result: 30/0.45 + 6 / 0.45, ending at 101%
    //
    // Day: we will proc our 3rd e4e in 4 hours which is 24% left to burn before
    //  we spend the last 21% at 0.45
    //  we spend 3% at 0.52
    //  we cook lunch and recover 2 energy
    //  we e4e proc to recover 18 energy, landing at (101 - 21 - 3 + 2 + 18) = 97%
    //  we spend the last 12 at 0.45
    // result: 21 / 0.45 + 3 / 0.52 + 12 / 0.45, ending at 85%
    //
    // Night: we spend the last 5% at 0.45, then 16% at 0.52 and recover 2 energy
    // result: 5 / 0.45 + 16 / 0.52, ending at 66% (64% + 2 dish recovery)
    const morning = 30 / 0.45 + 6 / 0.45;
    const day = 21 / 0.45 + 3 / 0.52 + 12 / 0.45;
    const evening = 5 / 0.45 + 16 / 0.52;

    const coeff = (morning + day + evening) / (15.5 * 6);
    return 1 / coeff;
  } else if (e4eProcs === 4) {
    // 1st proc on wake up, 3 more procs with 4 hours between
    // (24/0.45 + 12 / 0.45 + 12 / 0.45 + 24 / 0.45 + 21 / 0.45)/(15.5 * 6)
    // Energy at bedtime: 82%

    // --- Details ---
    // Morning: we recover +18 from e4e, landing at 118%
    //  we will proc our 2nd e4e in 4 hours which is 24% left to burn
    //  we spend 24% at 0.45
    //  we cooking breakfast and proc 2nd e4e, landing at 113% (118 - 24 + 1 + 18)
    //  we spend 12% at 0.45, landing at 101%
    // result: 24/0.45 + 12 / 0.45, ending at 101%

    // Day: we will proc our 3rd e4e in 2 hours which is 12% left to burn before
    //  we spend 12% at 0.45
    //  we proc 3rd e4e to recover 18 energy, landing at 107% (101 - 12 + 18)
    //  we spend 24% at 0.45 and cook lunch, landing at 84% (107 - 24 + 1)
    // result: 12 / 0.45 + 24 / 0.45, ending at 84%
    //
    // Night:
    //  we proc our 4th e4e to recover 18 energy, landing at 102%
    //  we spend the last 21% at 0.45
    //  we cook dinner and recover 1 energy, landing at 82% (102 - 21 + 1)
    // result: 21 / 0.45, ending at 82%
    const morning = 24 / 0.45 + 12 / 0.45;
    const day = 12 / 0.45 + 24 / 0.45;
    const evening = 21 / 0.45;

    const coeff = (morning + day + evening) / (15.5 * 6);
    return 1 / coeff;
  } else if (e4eProcs === 5) {
    // 1st proc on wake up, 4 more procs with 3 hours between
    // (18 / 0.45 + 18 / 0.45 + 18 / 0.45 + 18 / 0.45 + 21 / 0.45)/(15.5 * 6)
    // Energy at bedtime: 98%

    // --- Details ---
    // Morning: we recover +18 from e4e, landing at 118%
    //  we will proc our 2nd e4e in 3 hours which is 18% left to burn
    //  we spend 18% at 0.45
    //  we cooking breakfast (0 energy) and proc 2nd e4e, landing at 118% (118 - 18 + 0 + 18)
    //  we spend 18% at 0.45, landing at 100%
    // result: 18/0.45 + 18 / 0.45, ending at 100%

    // Day:
    //  we proc our 3rd e4e to recover 18 energy, landing at 118%
    //  we will proc our 4th e4e in 3 hours, which is 18% left to burn
    //  we spend 18% at 0.45
    //  we proc 4th e4e to recover 18 energy, landing at 118% (118 - 18 + 18)
    //  we spend 18% at 0.45
    //  we cook lunch (0 energy) and proc 5th e4e, landing at 118% (118 - 18 + 18)
    // result: 18 / 0.45 + 18 / 0.45, ending at 118%
    //
    // Night:
    //  we spend the last 21% at 0.45
    //  we cook dinner and recover 1 energy, landing at 98% (118 - 21 + 1)
    // result: 21 / 0.45, ending at 98%
    const morning = 18 / 0.45 + 18 / 0.45;
    const day = 18 / 0.45 + 18 / 0.45;
    const evening = 21 / 0.45;

    const coeff = (morning + day + evening) / (15.5 * 6);
    return 1 / coeff;
  } else {
    return 0.45;
  }
}

// /** ending energy values taken from calculateAwakeAverageEnergyCoefficient */
export function calculateAsleepAverageEnergyCoefficient(e4eProcs?: number) {
  // at night we have 8.5 hours, so 51% energy to burn
  const energyLossAtNight = 8.5 * 6;

  let coeff = 1;
  if (!e4eProcs) {
    coeff = energyLossAtNight * 1;
  } else if (e4eProcs === 1) {
    // ending energy = 33%
    // we spend 13% at 0.71
    // we spend remaining 38% at 1
    coeff = 13 / 0.71 + 38 / 1;
  } else if (e4eProcs === 2) {
    // ending energy = 49%
    // we spend 9% at 0.62
    // we spend 20% at 0.71
    // we spend remaining 22% at 1
    coeff = 9 / 0.62 + 20 / 0.71 + 22 / 1;
  } else if (e4eProcs === 3) {
    // ending energy = 66%
    // we spend 6% at 0.52
    // we spend 20% at 0.62
    // we spend 20% at 0.71
    // we spend remaining 5% at 1
    coeff = 6 / 0.52 + 20 / 0.62 + 20 / 0.71 + 5 / 1;
  } else if (e4eProcs === 4) {
    // ending energy = 82%
    // we spend 2% at 0.45
    // we spend 20% at 0.52
    // we spend 20% at 0.62
    // we spend 9% at 0.71
    coeff = 2 / 0.45 + 20 / 0.52 + 20 / 0.62 + 9 / 0.71;
  } else if (e4eProcs === 5) {
    // ending energy = 98%
    // we spend 18% at 0.45
    // we spend 20% at 0.52
    // we spend remaining 13% at 0.62
    coeff = 18 / 0.45 + 20 / 0.52 + 13 / 0.62;
  } else {
    // assumes we get unlimited energy, spend all night in best energy bracket
    coeff = energyLossAtNight / 0.45;
  }

  return 1 / (coeff / energyLossAtNight);
}
