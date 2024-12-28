import { createDessert } from '../../utils/recipe-utils/recipe-utils';
import {
  FANCY_APPLE,
  FANCY_EGG,
  GREENGRASS_CORN,
  GREENGRASS_SOYBEANS,
  HONEY,
  LARGE_LEEK,
  MOOMOO_MILK,
  PURE_OIL,
  ROUSING_COFFEE,
  SNOOZY_TOMATO,
  SOFT_POTATO,
  SOOTHING_CACAO,
  TASTY_MUSHROOM,
  WARMING_GINGER
} from '../ingredient/ingredient';
import type { Recipe } from './recipe';

export const MIXED_JUICE = createDessert({
  name: 'MIXED_JUICE',
  ingredients: [],
  bonus: 0
});

export const WARM_MOOMOO_MILK = createDessert({
  name: 'WARM_MOOMOO_MILK',
  ingredients: [{ amount: 7, ingredient: MOOMOO_MILK }],
  bonus: 18.7
});

export const FANCY_APPLE_JUICE = createDessert({
  name: 'FANCY_APPLE_JUICE',
  ingredients: [{ amount: 8, ingredient: FANCY_APPLE }],
  bonus: 18.7
});

export const CRAFT_SODA_POP = createDessert({
  name: 'CRAFT_SODA_POP',
  ingredients: [{ amount: 9, ingredient: HONEY }],
  bonus: 18.7
});

export const LUCKY_CHANT_APPLE_PIE = createDessert({
  name: 'LUCKY_CHANT_APPLE_PIE',
  ingredients: [
    { amount: 12, ingredient: FANCY_APPLE },
    { amount: 4, ingredient: MOOMOO_MILK }
  ],
  bonus: 18.77
});

export const FLUFFY_SWEET_POTATOES = createDessert({
  name: 'FLUFFY_SWEET_POTATOES',
  ingredients: [
    { amount: 9, ingredient: SOFT_POTATO },
    { amount: 5, ingredient: MOOMOO_MILK }
  ],
  bonus: 18.77
});

export const EMBER_GINGER_TEA = createDessert({
  name: 'EMBER_GINGER_TEA',
  ingredients: [
    { amount: 9, ingredient: WARMING_GINGER },
    { amount: 7, ingredient: FANCY_APPLE }
  ],
  bonus: 18.77
});

export const CLOUD_NINE_SOY_CAKE = createDessert({
  name: 'CLOUD_NINE_SOY_CAKE',
  ingredients: [
    { amount: 8, ingredient: FANCY_EGG },
    { amount: 7, ingredient: GREENGRASS_SOYBEANS }
  ],
  bonus: 18.77
});

export const STALWART_VEGETABLE_JUICE = createDessert({
  name: 'STALWART_VEGETABLE_JUICE',
  ingredients: [
    { amount: 9, ingredient: SNOOZY_TOMATO },
    { amount: 7, ingredient: FANCY_APPLE }
  ],
  bonus: 18.77
});

export const BIG_MALASADA = createDessert({
  name: 'BIG_MALASADA',
  ingredients: [
    { amount: 10, ingredient: PURE_OIL },
    { amount: 7, ingredient: MOOMOO_MILK },
    { amount: 6, ingredient: HONEY }
  ],
  bonus: 20.51
});

export const HUSTLE_PROTEIN_SMOOTHIE = createDessert({
  name: 'HUSTLE_PROTEIN_SMOOTHIE',
  ingredients: [
    { amount: 15, ingredient: GREENGRASS_SOYBEANS },
    { amount: 8, ingredient: SOOTHING_CACAO }
  ],
  bonus: 20.51
});

export const HUGE_POWER_SOY_DONUTS = createDessert({
  name: 'HUGE_POWER_SOY_DONUTS',
  ingredients: [
    { amount: 12, ingredient: PURE_OIL },
    { amount: 16, ingredient: GREENGRASS_SOYBEANS },
    { amount: 7, ingredient: SOOTHING_CACAO }
  ],
  bonus: 35
});

export const SWEET_SCENT_CHOCOLATE_CAKE = createDessert({
  name: 'SWEET_SCENT_CHOCOLATE_CAKE',
  ingredients: [
    { amount: 9, ingredient: HONEY },
    { amount: 8, ingredient: SOOTHING_CACAO },
    { amount: 7, ingredient: MOOMOO_MILK }
  ],
  bonus: 20.51
});

export const PETAL_DANCE_CHOCOLATE_TART = createDessert({
  name: 'PETAL_DANCE_CHOCOLATE_TART',
  ingredients: [
    { amount: 11, ingredient: FANCY_APPLE },
    { amount: 11, ingredient: SOOTHING_CACAO }
  ],
  bonus: 25
});

export const LOVELY_KISS_SMOOTHIE = createDessert({
  name: 'LOVELY_KISS_SMOOTHIE',
  ingredients: [
    { amount: 11, ingredient: FANCY_APPLE },
    { amount: 9, ingredient: MOOMOO_MILK },
    { amount: 7, ingredient: HONEY },
    { amount: 8, ingredient: SOOTHING_CACAO }
  ],
  bonus: 25
});

export const STEADFAST_GINGER_COOKIES = createDessert({
  name: 'STEADFAST_GINGER_COOKIES',
  ingredients: [
    { amount: 14, ingredient: HONEY },
    { amount: 12, ingredient: WARMING_GINGER },
    { amount: 5, ingredient: SOOTHING_CACAO },
    { amount: 4, ingredient: FANCY_EGG }
  ],
  bonus: 25
});

export const NEROLIS_RESTORATIVE_TEA = createDessert({
  name: 'NEROLIS_RESTORATIVE_TEA',
  ingredients: [
    { amount: 11, ingredient: WARMING_GINGER },
    { amount: 15, ingredient: FANCY_APPLE },
    { amount: 9, ingredient: TASTY_MUSHROOM }
  ],
  bonus: 25
});

export const EXPLOSION_POPCORN = createDessert({
  name: 'EXPLOSION_POPCORN',
  ingredients: [
    { amount: 15, ingredient: GREENGRASS_CORN },
    { amount: 14, ingredient: PURE_OIL },
    { amount: 7, ingredient: MOOMOO_MILK }
  ],
  bonus: 35
});

export const EARLY_BIRD_COFFEE_JELLY = createDessert({
  name: 'EARLY_BIRD_COFFEE_JELLY',
  ingredients: [
    { amount: 16, ingredient: ROUSING_COFFEE },
    { amount: 14, ingredient: MOOMOO_MILK },
    { amount: 12, ingredient: HONEY }
  ],
  bonus: 35
});

export const JIGGLYPUFFS_FRUITY_FLAN = createDessert({
  name: 'JIGGLYPUFFS_FRUITY_FLAN',
  ingredients: [
    { amount: 20, ingredient: HONEY },
    { amount: 15, ingredient: FANCY_EGG },
    { amount: 10, ingredient: MOOMOO_MILK },
    { amount: 10, ingredient: FANCY_APPLE }
  ],
  bonus: 35
});

export const TEATIME_CORN_SCONES = createDessert({
  name: 'TEATIME_CORN_SCONES',
  ingredients: [
    { amount: 20, ingredient: FANCY_APPLE },
    { amount: 20, ingredient: WARMING_GINGER },
    { amount: 18, ingredient: GREENGRASS_CORN },
    { amount: 9, ingredient: MOOMOO_MILK }
  ],
  bonus: 48
});

export const FLOWER_GIFT_MACARONS = createDessert({
  name: 'FLOWER_GIFT_MACARONS',
  ingredients: [
    { amount: 25, ingredient: SOOTHING_CACAO },
    { amount: 25, ingredient: FANCY_EGG },
    { amount: 17, ingredient: HONEY },
    { amount: 10, ingredient: MOOMOO_MILK }
  ],
  bonus: 48
});

export const ZING_ZAP_SPICED_COLA = createDessert({
  name: 'ZING_ZAP_SPICED_COLA',
  ingredients: [
    { amount: 35, ingredient: FANCY_APPLE },
    { amount: 20, ingredient: WARMING_GINGER },
    { amount: 20, ingredient: LARGE_LEEK },
    { amount: 12, ingredient: ROUSING_COFFEE }
  ],
  bonus: 61
});

export const DESSERTS: Recipe[] = [
  WARM_MOOMOO_MILK,
  FANCY_APPLE_JUICE,
  CRAFT_SODA_POP,
  LUCKY_CHANT_APPLE_PIE,
  FLUFFY_SWEET_POTATOES,
  EMBER_GINGER_TEA,
  CLOUD_NINE_SOY_CAKE,
  STALWART_VEGETABLE_JUICE,
  BIG_MALASADA,
  HUSTLE_PROTEIN_SMOOTHIE,
  HUGE_POWER_SOY_DONUTS,
  SWEET_SCENT_CHOCOLATE_CAKE,
  PETAL_DANCE_CHOCOLATE_TART,
  LOVELY_KISS_SMOOTHIE,
  STEADFAST_GINGER_COOKIES,
  NEROLIS_RESTORATIVE_TEA,
  EXPLOSION_POPCORN,
  EARLY_BIRD_COFFEE_JELLY,
  JIGGLYPUFFS_FRUITY_FLAN,
  TEATIME_CORN_SCONES,
  FLOWER_GIFT_MACARONS,
  ZING_ZAP_SPICED_COLA
];
