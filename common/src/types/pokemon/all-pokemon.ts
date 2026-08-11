import { createAllSpecialist } from '../../utils/pokemon-utils/pokemon-constructors';
import { toSeconds } from '../../utils/time-utils/frequency-utils';
import { MAGO, WIKI } from '../berry/berries';
import { GENDER_UNKNOWN } from '../gender';
import {
  BEAN_SAUSAGE,
  FANCY_APPLE,
  FANCY_EGG,
  FIERY_HERB,
  GLOSSY_AVOCADO,
  GREENGRASS_CORN,
  GREENGRASS_SOYBEANS,
  HONEY,
  LARGE_LEEK,
  LOCKED_INGREDIENT,
  MOOMOO_MILK,
  PURE_OIL,
  ROUSING_COFFEE,
  SLOWPOKE_TAIL
} from '../ingredient/ingredients';
import { ChargeStrengthMBadDreams, Versatile } from '../mainskill';
import type { Pokemon } from './pokemon';

export const MEW: Pokemon = createAllSpecialist({
  name: 'MEW',
  pokedexNumber: 151,
  frequency: toSeconds(0, 48, 20),
  ingredientPercentage: 20, // suspicious, but makes RP formula work
  skillPercentage: 4, // fake, but makes RP formula work
  berry: MAGO,
  genders: GENDER_UNKNOWN,
  carrySize: 26,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    ingredient0: [
      { amount: 2, ingredient: FANCY_EGG },
      { amount: 2, ingredient: LARGE_LEEK },
      { amount: 2, ingredient: FIERY_HERB },
      { amount: 2, ingredient: BEAN_SAUSAGE },
      { amount: 2, ingredient: PURE_OIL },
      { amount: 2, ingredient: GREENGRASS_SOYBEANS },
      { amount: 2, ingredient: GLOSSY_AVOCADO }
    ],
    ingredient30: [
      { amount: 4, ingredient: FIERY_HERB },
      { amount: 3, ingredient: LARGE_LEEK },
      { amount: 4, ingredient: FANCY_EGG },
      { amount: 4, ingredient: BEAN_SAUSAGE },
      { amount: 4, ingredient: PURE_OIL },
      { amount: 5, ingredient: GREENGRASS_SOYBEANS },
      { amount: 3, ingredient: GLOSSY_AVOCADO }
    ],
    ingredient60: [
      { amount: 0, ingredient: LOCKED_INGREDIENT },
      { amount: 4, ingredient: LARGE_LEEK },
      { amount: 6, ingredient: FANCY_EGG },
      { amount: 5, ingredient: FIERY_HERB },
      { amount: 7, ingredient: BEAN_SAUSAGE },
      { amount: 6, ingredient: PURE_OIL },
      { amount: 2, ingredient: SLOWPOKE_TAIL },
      { amount: 7, ingredient: GREENGRASS_SOYBEANS },
      { amount: 4, ingredient: GLOSSY_AVOCADO }
    ]
  },
  skill: Versatile,
  shinyLocked: true
});

export const DARKRAI: Pokemon = createAllSpecialist({
  name: 'DARKRAI',
  pokedexNumber: 491,
  frequency: toSeconds(0, 48, 20),
  ingredientPercentage: 19.2,
  skillPercentage: 2.3,
  berry: WIKI,
  genders: GENDER_UNKNOWN,
  carrySize: 28,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    ingredient0: [
      { amount: 2, ingredient: BEAN_SAUSAGE },
      { amount: 2, ingredient: FANCY_APPLE },
      { amount: 2, ingredient: FIERY_HERB },
      { amount: 2, ingredient: MOOMOO_MILK },
      { amount: 2, ingredient: HONEY },
      { amount: 2, ingredient: GREENGRASS_SOYBEANS },
      { amount: 2, ingredient: GREENGRASS_CORN },
      { amount: 2, ingredient: ROUSING_COFFEE }
    ],
    ingredient30: [
      { amount: 0, ingredient: LOCKED_INGREDIENT },
      { amount: 4, ingredient: BEAN_SAUSAGE },
      { amount: 5, ingredient: FANCY_APPLE },
      { amount: 3, ingredient: FIERY_HERB },
      { amount: 4, ingredient: MOOMOO_MILK },
      { amount: 4, ingredient: HONEY },
      { amount: 4, ingredient: GREENGRASS_SOYBEANS },
      { amount: 3, ingredient: GREENGRASS_CORN },
      { amount: 3, ingredient: ROUSING_COFFEE }
    ],
    ingredient60: [
      { amount: 0, ingredient: LOCKED_INGREDIENT },
      { amount: 6, ingredient: BEAN_SAUSAGE },
      { amount: 7, ingredient: FANCY_APPLE },
      { amount: 5, ingredient: FIERY_HERB },
      { amount: 6, ingredient: MOOMOO_MILK },
      { amount: 6, ingredient: HONEY },
      { amount: 6, ingredient: GREENGRASS_SOYBEANS },
      { amount: 4, ingredient: GREENGRASS_CORN },
      { amount: 4, ingredient: ROUSING_COFFEE }
    ]
  },
  skill: ChargeStrengthMBadDreams,
  shinyLocked: true
});
