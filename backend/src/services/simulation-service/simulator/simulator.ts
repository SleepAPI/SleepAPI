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
import { SkillActivation, SkillEvent } from '@src/domain/event/events/skill-event/skill-event';
import { Summary } from '@src/domain/event/events/summary-event/summary-event';
import { SleepInfo } from '@src/domain/sleep/sleep-info';
import { Time } from '@src/domain/time/time';
import {
  addSneakySnackEvent,
  helpEvent,
  inventoryFull,
  recoverEnergyEvents,
  recoverFromMeal,
  triggerTeamHelpsEvent,
} from '@src/utils/event-utils/event-utils';
import { finishSimulation, startDayAndEnergy, startNight } from '@src/utils/simulation-utils/simulation-utils';

import { InventoryUtils } from '@src/utils/inventory-utils/inventory-utils';
import { TimeUtils } from '@src/utils/time-utils/time-utils';
import { BerrySet, MathUtils, mainskill } from 'sleepapi-common';
import { maybeDegradeEnergy } from '../../calculator/energy/energy-calculator';
import { calculateFrequencyWithEnergy } from '../../calculator/help/help-calculator';
import { combineSameIngredientsInDrop } from '../../calculator/ingredient/ingredient-calculate';
import { clampHelp } from '../../calculator/production/produce-calculator';

/**
 * Runs the production simulation
 */
export function simulation(params: {
  dayInfo: SleepInfo;
  input: ProductionStats;
  helpFrequency: number;
  pokemonWithAverageProduce: PokemonProduce;
  inventoryLimit: number;
  sneakySnackBerries: BerrySet;
  recoveryEvents: EnergyEvent[];
  extraHelpfulEvents: SkillEvent[];
  helperBoostEvents: SkillEvent[];
  skillActivations: SkillActivation[];
  mealTimes: Time[];
}): { detailedProduce: DetailedProduce; log: ScheduledEvent[]; summary: Summary } {
  // Set up input
  const {
    dayInfo,
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
  } = params;
  const sneakySnackProduce: Produce = { berries: sneakySnackBerries, ingredients: [] };
  const { pokemon, produce: averageProduce } = pokemonWithAverageProduce;
  const averageProduceAmount = InventoryUtils.countInventory(averageProduce);

  // summary values
  let skillProcs = 0;
  let skillEnergySelfValue = 0;
  let skillEnergyOthersValue = 0;
  let skillProduceValue: Produce = InventoryUtils.getEmptyInventory();
  let skillStrengthValue = 0;
  let skillDreamShardValue = 0;
  let skillPotSizeValue = 0;
  let skillHelpsValue = 0;
  let skillTastyChanceValue = 0;
  let dayHelps = 0;
  let nightHelps = 0;
  let helpsBeforeSS = 0;
  let helpsAfterSS = 0;
  let collectFrequency = undefined;
  let totalRecovery = 0;
  const energyIntervals: number[] = [];
  const frequencyIntervals: number[] = [];

  // event array indices
  let skillIndex = 0;
  let energyIndex = 0;
  let mealIndex = 0;
  let helpfulIndex = 0;
  let boostIndex = 0;

  // Set up start values
  const eventLog: ScheduledEvent[] = [];
  const startingEnergy = startDayAndEnergy(
    dayInfo,
    pokemon,
    input,
    inventoryLimit,
    recoveryEvents,
    skillActivations,
    eventLog
  );

  let totalProduce: Produce = InventoryUtils.getEmptyInventory();
  let spilledIngredients: Produce = InventoryUtils.getEmptyInventory();
  let totalSneakySnack: Produce = {
    ingredients: [],
    berries: { amount: 0, berry: pokemonWithAverageProduce.pokemon.berry },
  };

  let currentEnergy = startingEnergy;
  let currentInventory: Produce = InventoryUtils.getEmptyInventory();

  let nextHelpEvent: Time = dayInfo.period.start;

  const energyEvents: EnergyEvent[] = TimeUtils.sortEventsForPeriod(dayInfo.period, recoveryEvents);
  const helpfulEvents: SkillEvent[] = TimeUtils.sortEventsForPeriod(dayInfo.period, extraHelpfulEvents);
  const boostEvents: SkillEvent[] = TimeUtils.sortEventsForPeriod(dayInfo.period, helperBoostEvents);

  let currentTime = dayInfo.period.start;
  let chunksOf5Minutes = 0;

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
    const { helpsProduce: helpfulProduce, helpEventsProcessed: helpfulEventsProcessed } = triggerTeamHelpsEvent({
      helpEvents: helpfulEvents,
      helpIndex: helpfulIndex,
      emptyProduce: InventoryUtils.getEmptyInventory(),
      currentTime,
      period,
      eventLog,
    });
    const { helpsProduce: boostProduce, helpEventsProcessed: boostEventsProcessed } = triggerTeamHelpsEvent({
      helpEvents: boostEvents,
      helpIndex: boostIndex,
      emptyProduce: InventoryUtils.getEmptyInventory(),
      currentTime,
      period,
      eventLog,
    });
    totalProduce = InventoryUtils.addToInventory(totalProduce, helpfulProduce);
    totalProduce = InventoryUtils.addToInventory(totalProduce, boostProduce);

    mealIndex = mealsProcessed;
    energyIndex = energyEventsProcessed;
    helpfulIndex = helpfulEventsProcessed;
    boostIndex = boostEventsProcessed;
    currentEnergy = Math.min(currentEnergy + mealRecovery + eventRecovery, 150);
    totalRecovery += mealRecovery + eventRecovery;

    // check if help has occured
    if (TimeUtils.isAfterOrEqualWithinPeriod({ currentTime, eventTime: nextHelpEvent, period })) {
      const frequency = calculateFrequencyWithEnergy(helpFrequency, currentEnergy);
      const nextHelp = TimeUtils.addTime(nextHelpEvent, TimeUtils.secondsToTime(frequency));
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
      ++dayHelps;
      frequencyIntervals.push(frequency);
      currentInventory = InventoryUtils.addToInventory(currentInventory, averageProduce);

      // check if next help scheduled help would hit inventory limit
      if (
        inventoryFull({ currentInventory, averageProduceAmount, inventoryLimit, currentTime: nextHelpEvent, eventLog })
      ) {
        if (!collectFrequency) {
          collectFrequency = TimeUtils.calculateDuration({ start: period.start, end: nextHelpEvent });
        }
        totalProduce = InventoryUtils.addToInventory(totalProduce, currentInventory);
        currentInventory = InventoryUtils.getEmptyInventory();
      }

      nextHelpEvent = nextHelp;
    }

    for (; skillIndex < skillActivations.length; skillIndex++) {
      const skillActivation = skillActivations[skillIndex];

      // if we have reached helps required or we are at the last help of the day
      if (
        dayHelps >= skillActivation.nrOfHelpsToActivate ||
        !TimeUtils.timeWithinPeriod(TimeUtils.addTime(currentTime, { hour: 0, minute: 5, second: 0 }), period)
      ) {
        skillProcs += skillActivation.fractionOfProc;
        const description = `${skillActivation.skill.name} activation`;

        eventLog.push(
          new SkillEvent({
            time: currentTime,
            description,
            skillActivation,
          })
        );

        if (skillActivation.skill.unit === 'energy') {
          const clampedDelta =
            currentEnergy + skillActivation.adjustedAmount > 150 ? 150 - currentEnergy : skillActivation.adjustedAmount;

          eventLog.push(
            new EnergyEvent({
              time: currentTime,
              delta: clampedDelta * dayInfo.nature.energy,
              description,
              before: currentEnergy,
            })
          );
          currentEnergy += clampedDelta * dayInfo.nature.energy;
          totalRecovery += clampedDelta * dayInfo.nature.energy;
          if (skillActivation.skill === mainskill.CHARGE_ENERGY_S) {
            skillEnergySelfValue += clampedDelta * dayInfo.nature.energy;
          } else {
            skillEnergyOthersValue += clampedDelta;
          }
        } else if (skillActivation.adjustedProduce) {
          if (skillActivation.skill === mainskill.EXTRA_HELPFUL_S || skillActivation.skill === mainskill.HELPER_BOOST) {
            skillHelpsValue += skillActivation.adjustedAmount;
          }
          skillProduceValue = InventoryUtils.addToInventory(skillProduceValue, skillActivation.adjustedProduce);
        } else if (skillActivation.skill.unit === 'strength') {
          skillStrengthValue += skillActivation.adjustedAmount;
        } else if (skillActivation.skill.unit === 'dream shards') {
          skillDreamShardValue += skillActivation.adjustedAmount;
        } else if (skillActivation.skill.unit === 'pot size') {
          skillPotSizeValue += skillActivation.adjustedAmount;
        } else if (skillActivation.skill.unit === 'chance') {
          skillTastyChanceValue += skillActivation.adjustedAmount;
        }
      } else break;
    }

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

    energyIntervals.push(currentEnergy);

    currentTime = TimeUtils.addTime(currentTime, { hour: 0, minute: 5, second: 0 });
  }

  // --- NIGHT ---
  startNight({ period, currentInventory, inventoryLimit, eventLog });
  totalProduce = InventoryUtils.addToInventory(totalProduce, currentInventory);
  currentInventory = InventoryUtils.getEmptyInventory();

  period = { start: dayInfo.period.end, end: dayInfo.period.start };

  while (TimeUtils.timeWithinPeriod(currentTime, period)) {
    if (TimeUtils.isAfterOrEqualWithinPeriod({ currentTime, eventTime: nextHelpEvent, period })) {
      const frequency = calculateFrequencyWithEnergy(helpFrequency, currentEnergy);
      const nextHelp = TimeUtils.addTime(nextHelpEvent, TimeUtils.secondsToTime(frequency));

      if (InventoryUtils.countInventory(currentInventory) >= inventoryLimit) {
        // sneaky snacking
        const spilledProduce: Produce = {
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

        spilledIngredients = InventoryUtils.addToInventory(spilledIngredients, averageProduce);
        totalSneakySnack = InventoryUtils.addToInventory(totalSneakySnack, sneakySnackProduce);
      } else if (InventoryUtils.countInventory(currentInventory) + averageProduceAmount >= inventoryLimit) {
        // next help starts sneaky snacking
        const inventorySpace = inventoryLimit - InventoryUtils.countInventory(currentInventory);
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

        currentInventory = InventoryUtils.addToInventory(currentInventory, clampedProduce);
        spilledIngredients = InventoryUtils.addToInventory(spilledIngredients, voidProduce);
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

        currentInventory = InventoryUtils.addToInventory(currentInventory, averageProduce);
      }

      ++nightHelps;
      frequencyIntervals.push(frequency);
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

    energyIntervals.push(currentEnergy);
    currentTime = TimeUtils.addTime(currentTime, { hour: 0, minute: 5, second: 0 });
  }

  totalProduce = InventoryUtils.addToInventory(totalProduce, currentInventory);
  totalProduce = InventoryUtils.addToInventory(totalProduce, skillProduceValue);
  totalProduce = InventoryUtils.addToInventory(totalProduce, totalSneakySnack);
  const summary: Summary = {
    skill: pokemon.skill,
    skillProcs,
    skillEnergySelfValue,
    skillEnergyOthersValue,
    skillProduceValue,
    skillStrengthValue,
    skillDreamShardValue,
    skillPotSizeValue,
    skillHelpsValue,
    skillTastyChanceValue,
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
      dayHelps,
      nightHelps,
      nightHelpsBeforeSS: nightHelps - helpsAfterSS,
      averageTotalSkillProcs: skillProcs,
      skillActivations,
    },
    log: eventLog,
    summary,
  };
}
