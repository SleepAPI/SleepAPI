/**
 * Copyright 2025 Neroli's Lab Authors
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

import type { PokemonProduce } from '@src/domain/combination/produce.js';
import type { ProductionStats } from '@src/domain/computed/production.js';
import type { ScheduledEvent } from '@src/domain/event/event.js';
import { EnergyEvent } from '@src/domain/event/events/energy-event/energy-event.js';
import { SkillEvent } from '@src/domain/event/events/skill-event/skill-event.js';
import type { SleepInfo } from '@src/domain/sleep/sleep-info.js';
import {
  addSneakySnackEvent,
  helpEvent,
  inventoryFull,
  recoverEnergyEvents,
  recoverFromMeal,
  triggerTeamHelpsEvent
} from '@src/utils/event-utils/event-utils.js';
import { finishSimulation, startDayAndEnergy, startNight } from '@src/utils/simulation-utils/simulation-utils.js';

import { maybeDegradeEnergy } from '@src/services/calculator/energy/energy-calculator.js';
import { calculateFrequencyWithEnergy } from '@src/services/calculator/help/help-calculator.js';
import { clampHelp } from '@src/services/calculator/production/produce-calculator.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import type { BerrySet, DetailedProduce, Produce, SkillActivation, Summary, Time } from 'sleepapi-common';
import {
  BerryBurst,
  BerryBurstDisguise,
  CarrySizeUtils,
  ChargeEnergyS,
  ChargeEnergySMoonlight,
  ExtraHelpfulS,
  HelperBoost,
  MathUtils,
  Metronome,
  combineSameIngredientsInDrop,
  emptyBerryInventory,
  emptyProduce
} from 'sleepapi-common';

/**
 * Runs the production simulation
 */
export function simulation(params: {
  dayInfo: SleepInfo;
  input: ProductionStats;
  helpFrequency: number;
  ingredientPercentage: number;
  skillPercentage: number;
  pokemonWithAverageProduce: PokemonProduce;
  inventoryLimit: number;
  sneakySnackBerries: BerrySet[];
  recoveryEvents: EnergyEvent[];
  extraHelpfulEvents: SkillEvent[];
  helperBoostEvents: SkillEvent[];
  skillActivations: SkillActivation[];
  mealTimes: Time[];
  maxEnergyRecovery: number;
}): { detailedProduce: DetailedProduce; log: ScheduledEvent[]; summary: Summary } {
  // Set up input
  const {
    dayInfo,
    input,
    helpFrequency,
    ingredientPercentage,
    skillPercentage,
    pokemonWithAverageProduce,
    inventoryLimit,
    sneakySnackBerries,
    recoveryEvents,
    extraHelpfulEvents,
    helperBoostEvents,
    skillActivations,
    mealTimes,
    maxEnergyRecovery
  } = params;
  const sneakySnackProduce: Produce = { berries: sneakySnackBerries, ingredients: [] };
  const { pokemon, produce: averageProduce } = pokemonWithAverageProduce;
  const averageProduceAmount = CarrySizeUtils.countInventory(averageProduce);

  // summary values
  let skillProcs = 0;
  let skillEnergySelfValue = 0;
  let skillEnergyOthersValue = 0;
  let skillProduceValue: Produce = CarrySizeUtils.getEmptyInventory();
  let skillBerriesOtherValue = 0;
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
    eventLog,
    maxEnergyRecovery
  );

  let totalProduce: Produce = CarrySizeUtils.getEmptyInventory();
  let spilledIngredients: Produce = CarrySizeUtils.getEmptyInventory();
  let totalSneakySnack: Produce = emptyProduce();

  let currentEnergy = startingEnergy;
  let currentInventory: Produce = CarrySizeUtils.getEmptyInventory();

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
      mealIndex
    });
    const { recoveredEnergy: eventRecovery, energyEventsProcessed } = recoverEnergyEvents({
      energyEvents,
      energyIndex,
      currentTime,
      currentEnergy,
      period,
      eventLog
    });
    const { helpsProduce: helpfulProduce, helpEventsProcessed: helpfulEventsProcessed } = triggerTeamHelpsEvent({
      helpEvents: helpfulEvents,
      helpIndex: helpfulIndex,
      emptyProduce: CarrySizeUtils.getEmptyInventory(),
      currentTime,
      period,
      eventLog
    });
    const { helpsProduce: boostProduce, helpEventsProcessed: boostEventsProcessed } = triggerTeamHelpsEvent({
      helpEvents: boostEvents,
      helpIndex: boostIndex,
      emptyProduce: CarrySizeUtils.getEmptyInventory(),
      currentTime,
      period,
      eventLog
    });
    totalProduce = CarrySizeUtils.addToInventory(totalProduce, helpfulProduce);
    totalProduce = CarrySizeUtils.addToInventory(totalProduce, boostProduce);

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
        eventLog
      });
      ++helpsBeforeSS;
      ++dayHelps;
      frequencyIntervals.push(frequency);
      currentInventory = CarrySizeUtils.addToInventory(currentInventory, averageProduce);

      // check if next help scheduled help would hit inventory limit
      if (
        inventoryFull({ currentInventory, averageProduceAmount, inventoryLimit, currentTime: nextHelpEvent, eventLog })
      ) {
        if (!collectFrequency) {
          collectFrequency = TimeUtils.calculateDuration({ start: period.start, end: nextHelpEvent });
        }
        totalProduce = CarrySizeUtils.addToInventory(totalProduce, currentInventory);
        currentInventory = CarrySizeUtils.getEmptyInventory();
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
            skillActivation
          })
        );

        if (skillActivation.skill.hasUnit('energy')) {
          const energyAmountWithNature = skillActivation.adjustedAmount * dayInfo.nature.energy;
          const clampedDelta =
            currentEnergy + energyAmountWithNature > 150 ? 150 - currentEnergy : energyAmountWithNature;

          eventLog.push(
            new EnergyEvent({
              time: currentTime,
              delta: clampedDelta,
              description,
              before: currentEnergy
            })
          );
          currentEnergy += clampedDelta;
          totalRecovery += clampedDelta;
          if (skillActivation.skill.is(ChargeEnergyS) || skillActivation.skill.is(ChargeEnergySMoonlight)) {
            skillEnergySelfValue += clampedDelta;
            if (skillActivation.skill.is(ChargeEnergySMoonlight)) {
              const energyFromCrit =
                skillActivation.fractionOfProc *
                (ChargeEnergySMoonlight.activations.energy.critAmount!({
                  skillLevel: input.skillLevel ?? skillActivation.skill.maxLevel
                }) /
                  5);

              skillEnergyOthersValue += energyFromCrit * ChargeEnergySMoonlight.critChance;
            }
          } else {
            skillEnergyOthersValue += skillActivation.adjustedAmount;
          }
        } else if (skillActivation.adjustedProduce) {
          if (skillActivation.skill.is(ExtraHelpfulS) || skillActivation.skill.is(HelperBoost)) {
            skillHelpsValue += skillActivation.adjustedAmount;
          } else if (skillActivation.skill.is(BerryBurstDisguise)) {
            const skillLevel = input.skillLevel ?? BerryBurstDisguise.maxLevel;
            const metronomeUser = pokemon.skill.is(Metronome);
            const metronomeFactor = metronomeUser ? Metronome.metronomeSkills.length : 1;

            const amountNoCrit =
              BerryBurstDisguise.activations.berries.teamAmount!({ skillLevel }) * skillActivation.fractionOfProc;
            const critChance = skillActivation.critChance ?? BerryBurstDisguise.critChance;

            const averageTeamBerryAmount =
              (amountNoCrit + critChance * amountNoCrit * BerryBurstDisguise.critMultiplier) / metronomeFactor;

            skillBerriesOtherValue += averageTeamBerryAmount;
          } else if (skillActivation.skill.is(BerryBurst)) {
            const skillLevel = input.skillLevel ?? BerryBurst.maxLevel;
            const metronomeUser = pokemon.skill.is(Metronome);
            const metronomeFactor = metronomeUser ? Metronome.metronomeSkills.length : 1;

            const amountNoCrit =
              BerryBurst.activations.berries.teamAmount!({ skillLevel }) * skillActivation.fractionOfProc;

            const averageTeamBerryAmount = amountNoCrit / metronomeFactor;

            skillBerriesOtherValue += averageTeamBerryAmount;
          }
          skillProduceValue = CarrySizeUtils.addToInventory(skillProduceValue, skillActivation.adjustedProduce);
        } else if (skillActivation.skill.hasUnit('strength')) {
          skillStrengthValue += skillActivation.adjustedAmount;
        } else if (skillActivation.skill.hasUnit('dream shards')) {
          skillDreamShardValue += skillActivation.adjustedAmount;
        } else if (skillActivation.skill.hasUnit('pot size')) {
          skillPotSizeValue += skillActivation.adjustedAmount;
        } else if (skillActivation.skill.hasUnit('crit chance')) {
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
          eventLog
        }),
      2
    );

    energyIntervals.push(currentEnergy);

    currentTime = TimeUtils.addTime(currentTime, { hour: 0, minute: 5, second: 0 });
  }

  // --- NIGHT ---
  startNight({ period, currentInventory, inventoryLimit, eventLog });
  totalProduce = CarrySizeUtils.addToInventory(totalProduce, currentInventory);
  currentInventory = CarrySizeUtils.getEmptyInventory();

  period = { start: dayInfo.period.end, end: dayInfo.period.start };

  while (TimeUtils.timeWithinPeriod(currentTime, period)) {
    if (TimeUtils.isAfterOrEqualWithinPeriod({ currentTime, eventTime: nextHelpEvent, period })) {
      const frequency = calculateFrequencyWithEnergy(helpFrequency, currentEnergy);
      const nextHelp = TimeUtils.addTime(nextHelpEvent, TimeUtils.secondsToTime(frequency));

      if (CarrySizeUtils.countInventory(currentInventory) >= inventoryLimit) {
        // sneaky snacking
        const spilledProduce: Produce = {
          berries: emptyBerryInventory(),
          ingredients: averageProduce.ingredients
        };

        addSneakySnackEvent({
          currentTime,
          frequency,
          sneakySnackProduce,
          totalSneakySnack,
          spilledProduce,
          totalSpilledIngredients: spilledIngredients,
          nextHelp,
          eventLog
        });
        ++helpsAfterSS;

        spilledIngredients = CarrySizeUtils.addToInventory(spilledIngredients, averageProduce);
        totalSneakySnack = CarrySizeUtils.addToInventory(totalSneakySnack, sneakySnackProduce);
      } else if (CarrySizeUtils.countInventory(currentInventory) + averageProduceAmount >= inventoryLimit) {
        // next help starts sneaky snacking
        const inventorySpace = inventoryLimit - CarrySizeUtils.countInventory(currentInventory);
        const clampedProduce = clampHelp({ inventorySpace, averageProduce, amount: averageProduceAmount });
        const voidProduce = clampHelp({
          inventorySpace: averageProduceAmount - inventorySpace,
          averageProduce,
          amount: averageProduceAmount
        });

        helpEvent({
          time: nextHelpEvent,
          frequency,
          produce: clampedProduce,
          amount: inventorySpace,
          currentInventory,
          inventoryLimit,
          nextHelp,
          eventLog
        });
        ++helpsBeforeSS;

        currentInventory = CarrySizeUtils.addToInventory(currentInventory, clampedProduce);
        spilledIngredients = CarrySizeUtils.addToInventory(spilledIngredients, voidProduce);
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
          eventLog
        });
        ++helpsBeforeSS;

        currentInventory = CarrySizeUtils.addToInventory(currentInventory, averageProduce);
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
          eventLog
        }),
      2
    );

    energyIntervals.push(currentEnergy);
    currentTime = TimeUtils.addTime(currentTime, { hour: 0, minute: 5, second: 0 });
  }

  totalProduce = CarrySizeUtils.addToInventory(totalProduce, currentInventory);
  // for skill berries we set level 0, so skill berries will always add a new index
  totalProduce = CarrySizeUtils.addToInventory(totalProduce, skillProduceValue);
  totalProduce = CarrySizeUtils.addToInventory(totalProduce, totalSneakySnack);
  const summary: Summary = {
    ingredientPercentage,
    skillPercentage,
    carrySize: inventoryLimit,
    skill: pokemon.skill,
    skillProcs,
    skillEnergySelfValue,
    skillEnergyOthersValue,
    skillProduceValue,
    skillBerriesOtherValue,
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
    totalRecovery
  };
  finishSimulation({ period, currentInventory, totalSneakySnack, inventoryLimit, summary, eventLog });

  return {
    detailedProduce: {
      produce: {
        berries: totalProduce.berries,
        ingredients: combineSameIngredientsInDrop(totalProduce.ingredients)
      },
      spilledIngredients: combineSameIngredientsInDrop(spilledIngredients.ingredients),
      sneakySnack: totalSneakySnack.berries,
      dayHelps,
      nightHelps,
      nightHelpsBeforeSS: nightHelps - helpsAfterSS,
      averageTotalSkillProcs: skillProcs,
      skillActivations
    },
    log: eventLog,
    summary
  };
}
