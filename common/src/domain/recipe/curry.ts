import {
  BEAN_SAUSAGE,
  FANCY_APPLE,
  FANCY_EGG,
  FIERY_HERB,
  GREENGRASS_CORN,
  GREENGRASS_SOYBEANS,
  HONEY,
  LARGE_LEEK,
  MOOMOO_MILK,
  PURE_OIL,
  SLOWPOKE_TAIL,
  SNOOZY_TOMATO,
  SOFT_POTATO,
  SOOTHING_CACAO,
  TASTY_MUSHROOM,
  WARMING_GINGER,
} from '../ingredient/ingredient';
import { Recipe } from './recipe';

export const FANCY_APPLE_CURRY: Recipe = {
  name: 'FANCY_APPLE_CURRY',
  value: 668,
  value50: 1657,
  type: 'curry',
  ingredients: [{ amount: 7, ingredient: FANCY_APPLE }],
  bonus: 6,
  nrOfIngredients: 7,
};

export const SIMPLE_CHOWDER: Recipe = {
  name: 'SIMPLE_CHOWDER',
  value: 727,
  value50: 1803,
  type: 'curry',
  ingredients: [{ amount: 7, ingredient: MOOMOO_MILK }],
  bonus: 6,
  nrOfIngredients: 7,
};

export const MILD_HONEY_CURRY: Recipe = {
  name: 'MILD_HONEY_CURRY',
  value: 749,
  value50: 1858,
  type: 'curry',
  ingredients: [{ amount: 7, ingredient: HONEY }],
  bonus: 6,
  nrOfIngredients: 7,
};

export const BEANBURGER_CURRY: Recipe = {
  name: 'BEANBURGER_CURRY',
  value: 764,
  value50: 1895,
  type: 'curry',
  ingredients: [{ amount: 7, ingredient: BEAN_SAUSAGE }],
  bonus: 6,
  nrOfIngredients: 7,
};

export const HEARTY_CHEESEBURGER_CURRY: Recipe = {
  name: 'HEARTY_CHEESEBURGER_CURRY',
  value: 1785,
  value50: 4427,
  type: 'curry',
  ingredients: [
    { amount: 8, ingredient: MOOMOO_MILK },
    { amount: 6, ingredient: BEAN_SAUSAGE },
  ],
  bonus: 11,
  nrOfIngredients: 14,
};

export const DROUGHT_KATSU_CURRY: Recipe = {
  name: 'DROUGHT_KATSU_CURRY',
  value: 1815,
  value50: 4501,
  type: 'curry',
  ingredients: [
    { amount: 10, ingredient: BEAN_SAUSAGE },
    { amount: 5, ingredient: PURE_OIL },
  ],
  bonus: 11,
  nrOfIngredients: 15,
};

export const SOLAR_POWER_TOMATO_CURRY: Recipe = {
  name: 'SOLAR_POWER_TOMATO_CURRY',
  value: 1943,
  value50: 4819,
  type: 'curry',
  ingredients: [
    { amount: 10, ingredient: SNOOZY_TOMATO },
    { amount: 5, ingredient: FIERY_HERB },
  ],
  bonus: 11,
  nrOfIngredients: 15,
};

export const MELTY_OMELETTE_CURRY: Recipe = {
  name: 'MELTY_OMELETTE_CURRY',
  value: 2009,
  value50: 4982,
  type: 'curry',
  ingredients: [
    { amount: 10, ingredient: FANCY_EGG },
    { amount: 6, ingredient: SNOOZY_TOMATO },
  ],
  bonus: 11,
  nrOfIngredients: 16,
};

export const SOFT_POTATO_CHOWDER: Recipe = {
  name: 'SOFT_POTATO_CHOWDER',
  value: 3089,
  value50: 7661,
  type: 'curry',
  ingredients: [
    { amount: 10, ingredient: MOOMOO_MILK },
    { amount: 8, ingredient: SOFT_POTATO },
    { amount: 4, ingredient: TASTY_MUSHROOM },
  ],
  bonus: 17,
  nrOfIngredients: 22,
};

export const BULK_UP_BEAN_CURRY: Recipe = {
  name: 'BULK_UP_BEAN_CURRY',
  value: 3274,
  value50: 8120,
  type: 'curry',
  ingredients: [
    { amount: 12, ingredient: GREENGRASS_SOYBEANS },
    { amount: 6, ingredient: BEAN_SAUSAGE },
    { amount: 4, ingredient: FIERY_HERB },
    { amount: 4, ingredient: FANCY_EGG },
  ],
  bonus: 17,
  nrOfIngredients: 26,
};

export const SPORE_MUSHROOM_CURRY: Recipe = {
  name: 'SPORE_MUSHROOM_CURRY',
  value: 4041,
  value50: 10022,
  type: 'curry',
  ingredients: [
    { amount: 14, ingredient: TASTY_MUSHROOM },
    { amount: 9, ingredient: SOFT_POTATO },
  ],
  bonus: 17,
  nrOfIngredients: 23,
};

export const EGG_BOMB_CURRY: Recipe = {
  name: 'EGG_BOMB_CURRY',
  value: 4523,
  value50: 11217,
  type: 'curry',
  ingredients: [
    { amount: 12, ingredient: HONEY },
    { amount: 11, ingredient: FANCY_APPLE },
    { amount: 8, ingredient: FANCY_EGG },
    { amount: 4, ingredient: SOFT_POTATO },
  ],
  bonus: 25,
  nrOfIngredients: 35,
};

export const LIMBER_CORN_STEW: Recipe = {
  name: 'LIMBER_CORN_STEW',
  value: 4670,
  value50: 11582,
  type: 'curry',
  ingredients: [
    { amount: 14, ingredient: GREENGRASS_CORN },
    { amount: 8, ingredient: MOOMOO_MILK },
    { amount: 8, ingredient: SOFT_POTATO },
  ],
  bonus: 25,
  nrOfIngredients: 30,
};

export const SPICY_LEEK_CURRY: Recipe = {
  name: 'SPICY_LEEK_CURRY',
  value: 5900,
  value50: 14632,
  type: 'curry',
  ingredients: [
    { amount: 14, ingredient: LARGE_LEEK },
    { amount: 10, ingredient: WARMING_GINGER },
    { amount: 8, ingredient: FIERY_HERB },
  ],
  bonus: 25,
  nrOfIngredients: 32,
};

export const NINJA_CURRY: Recipe = {
  name: 'NINJA_CURRY',
  value: 6159,
  value50: 15274,
  type: 'curry',
  ingredients: [
    { amount: 15, ingredient: GREENGRASS_SOYBEANS },
    { amount: 9, ingredient: BEAN_SAUSAGE },
    { amount: 9, ingredient: LARGE_LEEK },
    { amount: 5, ingredient: TASTY_MUSHROOM },
  ],
  bonus: 25,
  nrOfIngredients: 38,
};

export const GRILLED_TAIL_CURRY: Recipe = {
  name: 'GRILLED_TAIL_CURRY',
  value: 7483,
  value50: 18558,
  type: 'curry',
  ingredients: [
    { amount: 8, ingredient: SLOWPOKE_TAIL },
    { amount: 25, ingredient: FIERY_HERB },
  ],
  bonus: 25,
  nrOfIngredients: 33,
};

export const DREAM_EATER_BUTTER_CURRY: Recipe = {
  name: 'DREAM_EATER_BUTTER_CURRY',
  value: 9010,
  value50: 22345,
  type: 'curry',
  ingredients: [
    { amount: 18, ingredient: SOFT_POTATO },
    { amount: 15, ingredient: SNOOZY_TOMATO },
    { amount: 12, ingredient: SOOTHING_CACAO },
    { amount: 10, ingredient: MOOMOO_MILK },
  ],
  bonus: 35,
  nrOfIngredients: 55,
};

export const INFERNO_CORN_KEEMA_CURRY: Recipe = {
  name: 'INFERNO_CORN_KEEMA_CURRY',
  value: 13690,
  value50: 33951,
  type: 'curry',
  ingredients: [
    { amount: 27, ingredient: FIERY_HERB },
    { amount: 24, ingredient: BEAN_SAUSAGE },
    { amount: 14, ingredient: GREENGRASS_CORN },
    { amount: 12, ingredient: WARMING_GINGER },
  ],
  bonus: 48,
  nrOfIngredients: 77,
};

export const CURRIES: Recipe[] = [
  FANCY_APPLE_CURRY,
  SIMPLE_CHOWDER,
  MILD_HONEY_CURRY,
  BEANBURGER_CURRY,
  HEARTY_CHEESEBURGER_CURRY,
  DROUGHT_KATSU_CURRY,
  SOLAR_POWER_TOMATO_CURRY,
  MELTY_OMELETTE_CURRY,
  SOFT_POTATO_CHOWDER,
  BULK_UP_BEAN_CURRY,
  SPORE_MUSHROOM_CURRY,
  EGG_BOMB_CURRY,
  LIMBER_CORN_STEW,
  SPICY_LEEK_CURRY,
  NINJA_CURRY,
  GRILLED_TAIL_CURRY,
  DREAM_EATER_BUTTER_CURRY,
  INFERNO_CORN_KEEMA_CURRY,
];
