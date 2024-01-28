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
import { DetailedProduce, Produce } from '@src/domain/combination/produce';
import { LevelError } from '@src/domain/error/stat/stat-error';
import { BerrySet, IngredientSet, PokemonIngredientSet } from 'sleepapi-common';
import { calculateNrOfBerriesPerDrop } from '../berry/berry-calculator';
import { calculateHelpSpeed } from '../help/help-calculator';

export function calculateProduceForSpecificTimeWindow(params: {
  averagedPokemonCombination: PokemonIngredientSet;
  ingredientPercentage: number;
  customStats: CustomStats;
  energyPeriod: 'CUSTOM' | 'DAY' | 'NIGHT';
  timeWindow: number;
  goodCamp?: boolean;
  helpingBonus?: number;
  e4eProcs?: number;
}): Produce {
  const {
    averagedPokemonCombination,
    ingredientPercentage,
    customStats,
    energyPeriod: dayOrNight,
    timeWindow,
    goodCamp = false,
    helpingBonus = 0,
    e4eProcs = 0,
  } = params;

  if (customStats.level > 100 || customStats.level < 1) {
    throw new LevelError('Only level 1-100 allowed');
  }

  const SECONDS_IN_HOUR = 3600;

  const calculatedfrequency = calculateHelpSpeed({
    pokemon: averagedPokemonCombination.pokemon,
    energyPeriod: dayOrNight,
    goodCamp,
    customStats,
    nrOfHelpingBonus: helpingBonus,
    e4eProcs,
  });
  const helpsPerTimeWindow = (SECONDS_IN_HOUR / calculatedfrequency) * timeWindow;

  const ingredientDropsPerTimeWindow = helpsPerTimeWindow * ingredientPercentage;

  const berryDropsPerTimeWindow = helpsPerTimeWindow - ingredientDropsPerTimeWindow;

  const producedIngredients: IngredientSet[] = averagedPokemonCombination.ingredientList.map(
    ({ amount, ingredient }) => {
      return { amount: amount * ingredientDropsPerTimeWindow, ingredient };
    }
  );

  return {
    berries: {
      amount:
        berryDropsPerTimeWindow *
        calculateNrOfBerriesPerDrop(averagedPokemonCombination.pokemon, customStats.subskills),
      berry: averagedPokemonCombination.pokemon.berry,
    },
    ingredients: producedIngredients,
  };
}

export function calculateNightlyProduce(
  limit: number,
  averageProduce: Produce,
  totalProduce: Produce,
  berriesPerDrop: number
): DetailedProduce {
  const produceAmount =
    totalProduce.ingredients.reduce((sum, { amount }) => sum + amount, 0) + totalProduce.berries.amount;

  const averageProduceAmount =
    averageProduce.ingredients.reduce((sum, { amount }) => sum + amount, 0) + averageProduce.berries.amount;

  const helpsBeforeSS = produceAmount <= limit ? produceAmount / averageProduceAmount : limit / averageProduceAmount;

  // check if we hit cap
  if (produceAmount <= limit) {
    const emptySneakySnack: BerrySet = {
      amount: 0,
      berry: totalProduce.berries.berry,
    };
    return {
      produce: totalProduce,
      spilledIngredients: [],
      sneakySnack: emptySneakySnack,
      helpsBeforeSS,
      helpsAfterSS: 0,
    };
  }

  const helpsAfterSS = (produceAmount - limit) / averageProduceAmount;

  const clampFactor = produceAmount / limit;
  const clampedProduce: Produce = {
    berries: {
      amount: totalProduce.berries.amount / clampFactor,
      berry: totalProduce.berries.berry,
    },
    ingredients: totalProduce.ingredients.map(({ amount, ingredient }) => ({
      amount: amount / clampFactor,
      ingredient: ingredient,
    })),
  };

  const spilledIngredients: IngredientSet[] = averageProduce.ingredients.map(({ amount, ingredient }) => ({
    amount: amount * helpsAfterSS,
    ingredient: ingredient,
  }));

  const sneakySnack: BerrySet = { amount: helpsAfterSS * berriesPerDrop, berry: averageProduce.berries.berry };

  return {
    produce: clampedProduce,
    spilledIngredients,
    sneakySnack,
    helpsBeforeSS,
    helpsAfterSS,
  };
}

export function calculateAverageProduce(
  averagePokemonCombination: PokemonIngredientSet,
  ingredientPercentage: number,
  berriesPerDrop: number
): Produce {
  const result = {
    berries: {
      amount: berriesPerDrop * (1 - ingredientPercentage),
      berry: averagePokemonCombination.pokemon.berry,
    },
    ingredients: averagePokemonCombination.ingredientList.map(({ amount, ingredient }) => ({
      amount: amount * ingredientPercentage,
      ingredient: ingredient,
    })),
  };
  return result;
}
