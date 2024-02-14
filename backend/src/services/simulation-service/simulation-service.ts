/**
 * Calculates average ingredients produced per meal with natural declining energy
 * Calculate average nightly produce and subtracts overflow ingredients
 */

import { DetailedProduce, PokemonProduce } from '@src/domain/combination/produce';
import { ProductionStats } from '@src/domain/computed/production';
import { ScheduledEvent } from '@src/domain/event/event';
import { SleepInfo } from '@src/domain/sleep/sleep-info';
import { getDefaultRecoveryEvents } from '@src/utils/event-utils/event-utils';
import { getDefaultMealTimes } from '@src/utils/meal-utils/meal-utils';
import { BerrySet, PokemonIngredientSet, recipe } from 'sleepapi-common';
import { calculateNrOfBerriesPerDrop } from '../calculator/berry/berry-calculator';
import { calculateHelpSpeedBeforeEnergy } from '../calculator/help/help-calculator';
import {
  calculateAveragePokemonIngredientSet,
  calculateIngredientPercentage,
} from '../calculator/ingredient/ingredient-calculate';
import { calculateAverageProduce } from '../calculator/production/produce-calculator';
import { simulation } from './simulator';

/**
 * Sets up all the simulation input and runs the simulated production window
 */
export function setupAndRunProductionSimulation(params: {
  pokemonCombination: PokemonIngredientSet;
  input: ProductionStats;
}): { detailedProduce: DetailedProduce; log: ScheduledEvent[] } {
  const { pokemonCombination, input } = params;
  const { level, nature, subskills = [], e4e, helpingBonus, camp, erb, incense, mainBedtime, mainWakeup } = input;

  const averagedPokemonCombination = calculateAveragePokemonIngredientSet(pokemonCombination);

  const ingredientPercentage = calculateIngredientPercentage({
    pokemon: pokemonCombination.pokemon,
    nature,
    subskills,
  });

  const daySleepInfo: SleepInfo = {
    period: { end: mainBedtime, start: mainWakeup },
    nature,
    incense,
    erb,
  };

  const recoveryEvents = getDefaultRecoveryEvents(
    { start: daySleepInfo.period.start, end: daySleepInfo.period.end },
    nature,
    e4e
  );

  const mealTimes = getDefaultMealTimes(daySleepInfo.period);

  const berriesPerDrop = calculateNrOfBerriesPerDrop(averagedPokemonCombination.pokemon, subskills);

  const sneakySnackBerries: BerrySet = {
    amount: berriesPerDrop,
    berry: averagedPokemonCombination.pokemon.berry,
  };

  const pokemonWithAverageProduce: PokemonProduce = {
    pokemon: averagedPokemonCombination.pokemon,
    produce: calculateAverageProduce(averagedPokemonCombination, ingredientPercentage, berriesPerDrop),
  };

  const helpFrequency = calculateHelpSpeedBeforeEnergy({
    pokemon: averagedPokemonCombination.pokemon,
    level,
    nature,
    subskills,
    camp,
    helpingBonus,
  });

  const { detailedProduce, log } = simulation({
    dayInfo: daySleepInfo,
    input,
    helpFrequency,
    pokemonWithAverageProduce,
    sneakySnackBerries,
    recoveryEvents,
    mealTimes,
  });

  return {
    detailedProduce: {
      ...detailedProduce,
      produce: {
        berries: {
          amount: detailedProduce.produce.berries.amount,
          berry: detailedProduce.produce.berries.berry,
        },
        ingredients: detailedProduce.produce.ingredients.map(({ amount, ingredient }) => ({
          amount: amount / recipe.MEALS_IN_DAY,
          ingredient: ingredient,
        })),
      },
    },
    log,
  };
}
