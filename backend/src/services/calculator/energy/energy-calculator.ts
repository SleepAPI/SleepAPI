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

import { ScheduledEvent } from '@src/domain/event/event';
import { EnergyEvent } from '@src/domain/event/events/energy-event/energy-event';
import { SkillActivation } from '@src/domain/event/events/skill-event/skill-event';
import { SleepInfo } from '@src/domain/sleep/sleep-info';
import { Time, TimePeriod } from '@src/domain/time/time';
import { calculateDuration } from '@src/utils/time-utils/time-utils';
import { subskill } from 'sleepapi-common';

/**
 * Calculates a delta left at the end of the day and how that translates into tomorrow's starting energy
 */
export function calculateStartingEnergy(params: {
  dayPeriod: SleepInfo;
  recoveryEvents: EnergyEvent[];
  skillActivations: SkillActivation[];
}) {
  const { dayPeriod, recoveryEvents, skillActivations } = params;

  const sleepPeriod: TimePeriod = { start: dayPeriod.period.end, end: dayPeriod.period.start };
  const recoveryMainSleep = calculateSleepEnergyRecovery({ ...dayPeriod, period: sleepPeriod });

  const delta = calculateEnergyLeftInMorning(recoveryMainSleep, recoveryEvents, skillActivations);
  if (delta > 0) {
    const updatedDelta = calculateEnergyLeftInMorning(100, recoveryEvents, skillActivations);

    const energyLeftToRecover = 100 - updatedDelta;
    const energyRecovered = Math.min(energyLeftToRecover, recoveryMainSleep);
    const startingEnergy = updatedDelta + energyRecovered;

    return { startingEnergy, energyLeftInMorning: updatedDelta, energyRecovered };
  } else {
    const energyToRecover = 100;
    const startingEnergy = Math.min(energyToRecover, recoveryMainSleep);

    return { startingEnergy, energyLeftInMorning: 0, energyRecovered: startingEnergy };
  }
}

export function calculateEnergyLeftInMorning(
  sleepRecovery: number,
  recoveryEvents: EnergyEvent[],
  skillActivations: SkillActivation[]
): number {
  const energyFromRecoveryEvents = recoveryEvents.reduce((sum, proc) => sum + proc.delta, 0);
  const energyFromSkillProcs = skillActivations.reduce(
    (sum, cur) => sum + (cur.skill.unit === 'energy' ? cur.adjustedAmount : 0),
    0
  );

  const totalDayRecovery = energyFromRecoveryEvents + energyFromSkillProcs;

  const totalEnergyLoss = 24 * 6; // 24 hours, 6% lost per hour

  return Math.min(Math.max(sleepRecovery + totalDayRecovery - totalEnergyLoss, 0), 150);
}

/**
 * Uses numbers for representing Bedtime and Waking time
 * 21.5 = 21:30 (9:30PM)
 */
export function calculateSleepEnergyRecovery(dayPeriod: SleepInfo): number {
  const { period, nature, erb, incense } = dayPeriod;

  const erbFactor = 1 + erb * subskill.ENERGY_RECOVERY_BONUS.amount;
  const incenseFactor = incense ? 2 : 1;

  const energyRecoveredPerMinute = 100 / (8.5 * 60);

  const sleepDuration = calculateDuration(period);
  const sleepDurationInMinutes = sleepDuration.hour * 60 + sleepDuration.minute;

  return Math.min(sleepDurationInMinutes * energyRecoveredPerMinute * nature.energy * erbFactor * incenseFactor, 100);
}

export function maybeDegradeEnergy(params: {
  timeToDegrade: boolean;
  currentTime: Time;
  currentEnergy: number;
  eventLog: ScheduledEvent[];
}) {
  const { timeToDegrade, currentTime, currentEnergy, eventLog } = params;
  let energyToDegrade = 0;

  if (timeToDegrade) {
    if (currentEnergy > 0) {
      energyToDegrade = Math.min(1, currentEnergy);
    }
    const energyLossEvent: EnergyEvent = new EnergyEvent({
      time: currentTime,
      description: 'Degrade',
      delta: -energyToDegrade,
      before: currentEnergy,
    });

    eventLog.push(energyLossEvent);
  }

  return energyToDegrade;
}

export function energyFactorFromEnergy(energy: number) {
  if (energy >= 80) {
    return 0.45;
  } else if (energy >= 60) {
    return 0.52;
  } else if (energy >= 40) {
    return 0.62;
  } else if (energy >= 20) {
    return 0.71;
  } else {
    return 1;
  }
}
