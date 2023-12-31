import {
  BEAN_SAUSAGE,
  FANCY_APPLE,
  FANCY_EGG,
  FIERY_HERB,
  GREENGRASS_SOYBEANS,
  LARGE_LEEK,
  MOOMOO_MILK,
  PURE_OIL,
  SLOWPOKE_TAIL,
  SNOOZY_TOMATO,
  SOFT_POTATO,
  SOOTHING_CACAO,
  TASTY_MUSHROOM,
  WARMING_GINGER,
} from '../produce/ingredient';
import { Meal } from './meal';

export const FANCY_APPLE_SALAD: Meal = {
  name: 'FANCY_APPLE_SALAD',
  value: 763,
  value50: 1892,
  type: 'salad',
  ingredients: [{ amount: 8, ingredient: FANCY_APPLE }],
  bonus: 6,
  unlockables: false,
};

export const BEAN_HAM_SALAD: Meal = {
  name: 'BEAN_HAM_SALAD',
  value: 873,
  value50: 2165,
  type: 'salad',
  ingredients: [{ amount: 8, ingredient: BEAN_SAUSAGE }],
  bonus: 6,
  unlockables: false,
};

export const SNOOZY_TOMATO_SALAD: Meal = {
  name: 'SNOOZY_TOMATO_SALAD',
  value: 933,
  value50: 2314,
  type: 'salad',
  ingredients: [{ amount: 8, ingredient: SNOOZY_TOMATO }],
  bonus: 6,
  unlockables: false,
};

export const SNOW_CLOAK_CAESAR_SALAD: Meal = {
  name: 'SNOW_CLOAK_CAESAR_SALAD',
  value: 1774,
  value50: 4400,
  type: 'salad',
  ingredients: [
    { amount: 10, ingredient: MOOMOO_MILK },
    { amount: 6, ingredient: BEAN_SAUSAGE },
  ],
  bonus: 11,
  unlockables: false,
};

export const WATER_VEIL_TOFU_SALAD: Meal = {
  name: 'WATER_VEIL_TOFU_SALAD',
  value: 1843,
  value50: 4571,
  type: 'salad',
  ingredients: [
    { amount: 10, ingredient: GREENGRASS_SOYBEANS },
    { amount: 6, ingredient: SNOOZY_TOMATO },
  ],
  bonus: 11,
  unlockables: false,
};

export const HEAT_WAVE_TOFU_SALAD: Meal = {
  name: 'HEAT_WAVE_TOFU_SALAD',
  value: 1976,
  value50: 4900,
  type: 'salad',
  ingredients: [
    { amount: 10, ingredient: GREENGRASS_SOYBEANS },
    { amount: 6, ingredient: FIERY_HERB },
  ],
  bonus: 11,
  unlockables: false,
};

export const DAZZLING_APPLE_CHEESE_SALAD: Meal = {
  name: 'DAZZLING_APPLE_CHEESE_SALAD',
  value: 2578,
  value50: 6393,
  type: 'salad',
  ingredients: [
    { amount: 15, ingredient: FANCY_APPLE },
    { amount: 5, ingredient: MOOMOO_MILK },
    { amount: 3, ingredient: PURE_OIL },
  ],
  bonus: 17,
  unlockables: false,
};

export const MOOMOO_CAPRESE_SALAD: Meal = {
  name: 'MOOMOO_CAPRESE_SALAD',
  value: 2856,
  value50: 7083,
  type: 'salad',
  ingredients: [
    { amount: 12, ingredient: MOOMOO_MILK },
    { amount: 6, ingredient: SNOOZY_TOMATO },
    { amount: 5, ingredient: PURE_OIL },
  ],
  bonus: 17,
  unlockables: false,
};

export const IMMUNITY_LEEK_SALAD: Meal = {
  name: 'IMMUNITY_LEEK_SALAD',
  value: 2856,
  value50: 6592,
  type: 'salad',
  ingredients: [
    { amount: 10, ingredient: LARGE_LEEK },
    { amount: 5, ingredient: WARMING_GINGER },
  ],
  bonus: 11,
  unlockables: true,
};

export const SUPERPOWER_EXTREME_SALAD: Meal = {
  name: 'SUPERPOWER_EXTREME_SALAD',
  value: 2958,
  value50: 7336,
  type: 'salad',
  ingredients: [
    { amount: 9, ingredient: BEAN_SAUSAGE },
    { amount: 6, ingredient: WARMING_GINGER },
    { amount: 5, ingredient: FANCY_EGG },
    { amount: 3, ingredient: SOFT_POTATO },
  ],
  bonus: 17,
  unlockables: true,
};

export const CONTRARY_CHOCOLATE_MEAT_SALAD: Meal = {
  name: 'CONTRARY_CHOCOLATE_MEAT_SALAD',
  value: 3558,
  value50: 8824,
  type: 'salad',
  ingredients: [
    { amount: 14, ingredient: SOOTHING_CACAO },
    { amount: 9, ingredient: BEAN_SAUSAGE },
  ],
  bonus: 17,
  unlockables: false,
};

export const GLUTTONY_POTATO_SALAD: Meal = {
  name: 'GLUTTONY_POTATO_SALAD',
  value: 5040,
  value50: 12499,
  type: 'salad',
  ingredients: [
    { amount: 14, ingredient: SOFT_POTATO },
    { amount: 9, ingredient: FANCY_EGG },
    { amount: 7, ingredient: BEAN_SAUSAGE },
    { amount: 6, ingredient: FANCY_APPLE },
  ],
  bonus: 25,
  unlockables: true,
};

export const OVERHEAT_GINGER_SALAD: Meal = {
  name: 'OVERHEAT_GINGER_SALAD',
  value: 5040,
  value50: 12958,
  type: 'salad',
  ingredients: [
    { amount: 17, ingredient: FIERY_HERB },
    { amount: 10, ingredient: WARMING_GINGER },
    { amount: 8, ingredient: SNOOZY_TOMATO },
  ],
  bonus: 25,
  unlockables: false,
};

export const SPORE_MUSHROOM_SALAD: Meal = {
  name: 'SPORE_MUSHROOM_SALAD',
  value: 5859,
  value50: 14530,
  type: 'salad',
  ingredients: [
    { amount: 17, ingredient: TASTY_MUSHROOM },
    { amount: 8, ingredient: SNOOZY_TOMATO },
    { amount: 8, ingredient: PURE_OIL },
  ],
  bonus: 25,
  unlockables: true,
};

export const SLOWPOKE_TAIL_PEPPER_SALAD: Meal = {
  name: 'SLOWPOKE_TAIL_PEPPER_SALAD',
  value: 8169,
  value50: 20259,
  type: 'salad',
  ingredients: [
    { amount: 10, ingredient: SLOWPOKE_TAIL },
    { amount: 10, ingredient: FIERY_HERB },
    { amount: 15, ingredient: PURE_OIL },
  ],
  bonus: 25,
  unlockables: true,
};

export const NINJA_SALAD: Meal = {
  name: 'NINJA_SALAD',
  value: 10095,
  value50: 25036,
  type: 'salad',
  ingredients: [
    { amount: 15, ingredient: LARGE_LEEK },
    { amount: 15, ingredient: GREENGRASS_SOYBEANS },
    { amount: 12, ingredient: TASTY_MUSHROOM },
    { amount: 11, ingredient: WARMING_GINGER },
  ],
  bonus: 35,
  unlockables: true,
};

export const SALADS: Meal[] = [
  FANCY_APPLE_SALAD,
  BEAN_HAM_SALAD,
  SNOOZY_TOMATO_SALAD,
  SNOW_CLOAK_CAESAR_SALAD,
  WATER_VEIL_TOFU_SALAD,
  HEAT_WAVE_TOFU_SALAD,
  DAZZLING_APPLE_CHEESE_SALAD,
  MOOMOO_CAPRESE_SALAD,
  IMMUNITY_LEEK_SALAD,
  SUPERPOWER_EXTREME_SALAD,
  CONTRARY_CHOCOLATE_MEAT_SALAD,
  GLUTTONY_POTATO_SALAD,
  OVERHEAT_GINGER_SALAD,
  SPORE_MUSHROOM_SALAD,
  SLOWPOKE_TAIL_PEPPER_SALAD,
  NINJA_SALAD,
];

export const ADVANCED_SALADS: Meal[] = [
  SNOW_CLOAK_CAESAR_SALAD,
  WATER_VEIL_TOFU_SALAD,
  HEAT_WAVE_TOFU_SALAD,
  DAZZLING_APPLE_CHEESE_SALAD,
  MOOMOO_CAPRESE_SALAD,
  IMMUNITY_LEEK_SALAD,
  SUPERPOWER_EXTREME_SALAD,
  CONTRARY_CHOCOLATE_MEAT_SALAD,
  GLUTTONY_POTATO_SALAD,
  OVERHEAT_GINGER_SALAD,
  SPORE_MUSHROOM_SALAD,
  SLOWPOKE_TAIL_PEPPER_SALAD,
  NINJA_SALAD,
];

export const ADVANCED_UNLOCKED_SALADS: Meal[] = [
  SNOW_CLOAK_CAESAR_SALAD,
  WATER_VEIL_TOFU_SALAD,
  HEAT_WAVE_TOFU_SALAD,
  DAZZLING_APPLE_CHEESE_SALAD,
  MOOMOO_CAPRESE_SALAD,
  CONTRARY_CHOCOLATE_MEAT_SALAD,
  OVERHEAT_GINGER_SALAD,
];

export const LATEGAME_SALADS: Meal[] = [
  GLUTTONY_POTATO_SALAD,
  OVERHEAT_GINGER_SALAD,
  SPORE_MUSHROOM_SALAD,
  SLOWPOKE_TAIL_PEPPER_SALAD,
  NINJA_SALAD,
];
