import { createSalad } from '../../utils/recipe-utils/recipe-utils';
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
  ROUSING_COFFEE,
  SLOWPOKE_TAIL,
  SNOOZY_TOMATO,
  SOFT_POTATO,
  SOOTHING_CACAO,
  TASTY_MUSHROOM,
  WARMING_GINGER,
} from '../ingredient/ingredient';
import { Recipe } from './recipe';

export const MIXED_SALAD = createSalad({
  name: 'MIXED_SALAD',
  ingredients: [],
  bonus: 0,
});

export const FANCY_APPLE_SALAD = createSalad({
  name: 'FANCY_APPLE_SALAD',
  ingredients: [{ amount: 8, ingredient: FANCY_APPLE }],
  bonus: 18.7,
});

export const BEAN_HAM_SALAD = createSalad({
  name: 'BEAN_HAM_SALAD',
  ingredients: [{ amount: 8, ingredient: BEAN_SAUSAGE }],
  bonus: 18.7,
});

export const SNOOZY_TOMATO_SALAD = createSalad({
  name: 'SNOOZY_TOMATO_SALAD',
  ingredients: [{ amount: 8, ingredient: SNOOZY_TOMATO }],
  bonus: 18.7,
});

export const SNOW_CLOAK_CAESAR_SALAD = createSalad({
  name: 'SNOW_CLOAK_CAESAR_SALAD',
  ingredients: [
    { amount: 10, ingredient: MOOMOO_MILK },
    { amount: 6, ingredient: BEAN_SAUSAGE },
  ],
  bonus: 18.77,
});

export const WATER_VEIL_TOFU_SALAD = createSalad({
  name: 'WATER_VEIL_TOFU_SALAD',
  ingredients: [
    { amount: 15, ingredient: GREENGRASS_SOYBEANS },
    { amount: 9, ingredient: SNOOZY_TOMATO },
  ],
  bonus: 25,
});

export const HEAT_WAVE_TOFU_SALAD = createSalad({
  name: 'HEAT_WAVE_TOFU_SALAD',
  ingredients: [
    { amount: 10, ingredient: GREENGRASS_SOYBEANS },
    { amount: 6, ingredient: FIERY_HERB },
  ],
  bonus: 18.77,
});

export const DAZZLING_APPLE_CHEESE_SALAD = createSalad({
  name: 'DAZZLING_APPLE_CHEESE_SALAD',
  ingredients: [
    { amount: 15, ingredient: FANCY_APPLE },
    { amount: 5, ingredient: MOOMOO_MILK },
    { amount: 3, ingredient: PURE_OIL },
  ],
  bonus: 20.51,
});

export const FURY_ATTACK_CORN_SALAD = createSalad({
  name: 'FURY_ATTACK_CORN_SALAD',
  ingredients: [
    { amount: 9, ingredient: GREENGRASS_CORN },
    { amount: 8, ingredient: PURE_OIL },
  ],
  bonus: 25,
});

export const MOOMOO_CAPRESE_SALAD = createSalad({
  name: 'MOOMOO_CAPRESE_SALAD',
  ingredients: [
    { amount: 12, ingredient: MOOMOO_MILK },
    { amount: 6, ingredient: SNOOZY_TOMATO },
    { amount: 5, ingredient: PURE_OIL },
  ],
  bonus: 20.51,
});

export const IMMUNITY_LEEK_SALAD = createSalad({
  name: 'IMMUNITY_LEEK_SALAD',
  ingredients: [
    { amount: 10, ingredient: LARGE_LEEK },
    { amount: 5, ingredient: WARMING_GINGER },
  ],
  bonus: 18.77,
});

export const SUPERPOWER_EXTREME_SALAD = createSalad({
  name: 'SUPERPOWER_EXTREME_SALAD',
  ingredients: [
    { amount: 9, ingredient: BEAN_SAUSAGE },
    { amount: 6, ingredient: WARMING_GINGER },
    { amount: 5, ingredient: FANCY_EGG },
    { amount: 3, ingredient: SOFT_POTATO },
  ],
  bonus: 20.51,
});

export const CONTRARY_CHOCOLATE_MEAT_SALAD = createSalad({
  name: 'CONTRARY_CHOCOLATE_MEAT_SALAD',
  ingredients: [
    { amount: 14, ingredient: SOOTHING_CACAO },
    { amount: 9, ingredient: BEAN_SAUSAGE },
  ],
  bonus: 20.51,
});

export const GLUTTONY_POTATO_SALAD = createSalad({
  name: 'GLUTTONY_POTATO_SALAD',
  ingredients: [
    { amount: 14, ingredient: SOFT_POTATO },
    { amount: 9, ingredient: FANCY_EGG },
    { amount: 7, ingredient: BEAN_SAUSAGE },
    { amount: 6, ingredient: FANCY_APPLE },
  ],
  bonus: 25,
});

export const OVERHEAT_GINGER_SALAD = createSalad({
  name: 'OVERHEAT_GINGER_SALAD',
  ingredients: [
    { amount: 17, ingredient: FIERY_HERB },
    { amount: 10, ingredient: WARMING_GINGER },
    { amount: 8, ingredient: SNOOZY_TOMATO },
  ],
  bonus: 25,
});

export const SPORE_MUSHROOM_SALAD = createSalad({
  name: 'SPORE_MUSHROOM_SALAD',
  ingredients: [
    { amount: 17, ingredient: TASTY_MUSHROOM },
    { amount: 8, ingredient: SNOOZY_TOMATO },
    { amount: 8, ingredient: PURE_OIL },
  ],
  bonus: 25,
});

export const CALM_MIND_FRUIT_SALAD = createSalad({
  name: 'CALM_MIND_FRUIT_SALAD',
  ingredients: [
    { amount: 21, ingredient: FANCY_APPLE },
    { amount: 16, ingredient: HONEY },
    { amount: 12, ingredient: GREENGRASS_CORN },
  ],
  bonus: 48,
});

export const SLOWPOKE_TAIL_PEPPER_SALAD = createSalad({
  name: 'SLOWPOKE_TAIL_PEPPER_SALAD',
  ingredients: [
    { amount: 10, ingredient: SLOWPOKE_TAIL },
    { amount: 10, ingredient: FIERY_HERB },
    { amount: 15, ingredient: PURE_OIL },
  ],
  bonus: 25,
});

export const NINJA_SALAD = createSalad({
  name: 'NINJA_SALAD',
  ingredients: [
    { amount: 15, ingredient: LARGE_LEEK },
    { amount: 19, ingredient: GREENGRASS_SOYBEANS },
    { amount: 12, ingredient: TASTY_MUSHROOM },
    { amount: 11, ingredient: WARMING_GINGER },
  ],
  bonus: 48,
});

export const CROSS_CHOP_SALAD = createSalad({
  name: 'CROSS_CHOP_SALAD',
  ingredients: [
    { amount: 20, ingredient: FANCY_EGG },
    { amount: 15, ingredient: BEAN_SAUSAGE },
    { amount: 11, ingredient: GREENGRASS_CORN },
    { amount: 10, ingredient: SNOOZY_TOMATO },
  ],
  bonus: 35,
});

export const GREENGRASS_SALAD = createSalad({
  name: 'GREENGRASS_SALAD',
  ingredients: [
    { amount: 22, ingredient: PURE_OIL },
    { amount: 17, ingredient: GREENGRASS_CORN },
    { amount: 14, ingredient: SNOOZY_TOMATO },
    { amount: 9, ingredient: SOFT_POTATO },
  ],
  bonus: 48,
});

export const DEFIANT_COFFEE_DRESSED_SALAD = createSalad({
  name: 'DEFIANT_COFFEE_DRESSED_SALAD',
  ingredients: [
    { amount: 28, ingredient: ROUSING_COFFEE },
    { amount: 28, ingredient: BEAN_SAUSAGE },
    { amount: 22, ingredient: PURE_OIL },
    { amount: 22, ingredient: SOFT_POTATO },
  ],
  bonus: 61,
});

export const SALADS: Recipe[] = [
  FANCY_APPLE_SALAD,
  BEAN_HAM_SALAD,
  SNOOZY_TOMATO_SALAD,
  SNOW_CLOAK_CAESAR_SALAD,
  WATER_VEIL_TOFU_SALAD,
  HEAT_WAVE_TOFU_SALAD,
  FURY_ATTACK_CORN_SALAD,
  DAZZLING_APPLE_CHEESE_SALAD,
  MOOMOO_CAPRESE_SALAD,
  IMMUNITY_LEEK_SALAD,
  SUPERPOWER_EXTREME_SALAD,
  CONTRARY_CHOCOLATE_MEAT_SALAD,
  GLUTTONY_POTATO_SALAD,
  OVERHEAT_GINGER_SALAD,
  SPORE_MUSHROOM_SALAD,
  CALM_MIND_FRUIT_SALAD,
  SLOWPOKE_TAIL_PEPPER_SALAD,
  CROSS_CHOP_SALAD,
  GREENGRASS_SALAD,
  NINJA_SALAD,
  DEFIANT_COFFEE_DRESSED_SALAD,
];
