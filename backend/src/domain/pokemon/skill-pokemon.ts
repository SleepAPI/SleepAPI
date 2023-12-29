import {
  BELUE,
  CHERI,
  CHESTO,
  DURIN,
  GREPA,
  LEPPA,
  LUM,
  MAGO,
  ORAN,
  PECHA,
  PERSIM,
  RAWST,
  SITRUS,
  WIKI,
} from '../produce/berry';
import {
  BEAN_SAUSAGE,
  FANCY_APPLE,
  FANCY_EGG,
  FIERY_HERB,
  GREENGRASS_SOYBEANS,
  HONEY,
  MOOMOO_MILK,
  PURE_OIL,
  SLOWPOKE_TAIL,
  SNOOZY_TOMATO,
  SOFT_POTATO,
  SOOTHING_CACAO,
  TASTY_MUSHROOM,
  WARMING_GINGER,
} from '../produce/ingredient';
import {
  CHARGE_ENERGY_S,
  CHARGE_STRENGTH_M,
  CHARGE_STRENGTH_S_RANGE,
  COOKING_POWER_UP_S,
  DREAM_SHARD_MAGNET_S,
  DREAM_SHARD_MAGNET_S_RANGE,
  ENERGIZING_CHEER_S,
  ENERGY_FOR_EVERYONE,
  EXTRA_HELPFUL_S,
  INGREDIENT_MAGNET_S,
  METRONOME,
} from '../stat/mainskill';
import { Pokemon } from './pokemon';

export const PIKACHU_CHRISTMAS: Pokemon = {
  name: 'PIKACHU_CHRISTMAS',
  specialty: 'skill',
  frequency: 2600,
  ingredientPercentage: 13.09,
  skillPercentage: 2,
  berry: GREPA,
  carrySize: 16,
  maxCarrySize: 16,
  ingredient0: { amount: 1, ingredient: FANCY_APPLE },
  ingredient30: [
    { amount: 2, ingredient: FANCY_APPLE },
    { amount: 2, ingredient: WARMING_GINGER },
  ],
  ingredient60: [
    { amount: 4, ingredient: FANCY_APPLE },
    { amount: 3, ingredient: FANCY_EGG },
    { amount: 3, ingredient: WARMING_GINGER },
  ],
  skill: DREAM_SHARD_MAGNET_S,
};

export const WIGGLYTUFF: Pokemon = {
  name: 'WIGGLYTUFF',
  specialty: 'skill',
  frequency: 2900,
  ingredientPercentage: 17.26,
  skillPercentage: 6.24,
  berry: PECHA,
  carrySize: 13,
  maxCarrySize: 23,
  ingredient0: { amount: 1, ingredient: HONEY },
  ingredient30: [
    { amount: 2, ingredient: HONEY },
    { amount: 2, ingredient: PURE_OIL },
  ],
  ingredient60: [
    { amount: 4, ingredient: HONEY },
    { amount: 3, ingredient: PURE_OIL },
    { amount: 2, ingredient: SOOTHING_CACAO },
  ],
  skill: ENERGY_FOR_EVERYONE,
};

export const PERSIAN: Pokemon = {
  name: 'PERSIAN',
  specialty: 'skill',
  frequency: 3000,
  ingredientPercentage: 16.87,
  skillPercentage: 5.49,
  berry: PERSIM,
  carrySize: 12,
  maxCarrySize: 17,
  ingredient0: { amount: 1, ingredient: MOOMOO_MILK },
  ingredient30: [
    { amount: 2, ingredient: MOOMOO_MILK },
    { amount: 2, ingredient: BEAN_SAUSAGE },
  ],
  ingredient60: [
    { amount: 4, ingredient: MOOMOO_MILK },
    { amount: 3, ingredient: BEAN_SAUSAGE },
  ],
  skill: DREAM_SHARD_MAGNET_S,
};

export const GOLDUCK: Pokemon = {
  name: 'GOLDUCK',
  specialty: 'skill',
  frequency: 3400,
  ingredientPercentage: 13.39,
  skillPercentage: 7.209,
  berry: ORAN,
  carrySize: 11,
  maxCarrySize: 16,
  ingredient0: { amount: 1, ingredient: SOOTHING_CACAO },
  ingredient30: [
    { amount: 2, ingredient: SOOTHING_CACAO },
    { amount: 4, ingredient: FANCY_APPLE },
  ],
  ingredient60: [
    { amount: 4, ingredient: SOOTHING_CACAO },
    { amount: 6, ingredient: FANCY_APPLE },
    { amount: 5, ingredient: BEAN_SAUSAGE },
  ],
  skill: CHARGE_STRENGTH_S_RANGE,
};

export const ARCANINE: Pokemon = {
  name: 'ARCANINE',
  specialty: 'skill',
  frequency: 2500,
  ingredientPercentage: 13.61,
  skillPercentage: 12.23,
  berry: LEPPA,
  carrySize: 16,
  maxCarrySize: 21,
  ingredient0: { amount: 1, ingredient: FIERY_HERB },
  ingredient30: [
    { amount: 2, ingredient: FIERY_HERB },
    { amount: 3, ingredient: BEAN_SAUSAGE },
  ],
  ingredient60: [
    { amount: 4, ingredient: FIERY_HERB },
    { amount: 5, ingredient: BEAN_SAUSAGE },
    { amount: 5, ingredient: MOOMOO_MILK },
  ],
  skill: EXTRA_HELPFUL_S,
};

export const SLOWBRO: Pokemon = {
  name: 'SLOWBRO',
  specialty: 'skill',
  frequency: 3800,
  ingredientPercentage: 15.05,
  skillPercentage: 14.93,
  berry: ORAN,
  carrySize: 10,
  maxCarrySize: 15,
  ingredient0: { amount: 1, ingredient: SOOTHING_CACAO },
  ingredient30: [
    { amount: 2, ingredient: SOOTHING_CACAO },
    { amount: 1, ingredient: SLOWPOKE_TAIL },
  ],
  ingredient60: [
    { amount: 4, ingredient: SOOTHING_CACAO },
    { amount: 2, ingredient: SLOWPOKE_TAIL },
    { amount: 5, ingredient: SNOOZY_TOMATO },
  ],
  skill: ENERGIZING_CHEER_S,
};

export const VAPOREON: Pokemon = {
  name: 'VAPOREON',
  specialty: 'skill',
  frequency: 3100,
  ingredientPercentage: 21.17,
  skillPercentage: 6.531,
  berry: ORAN,
  carrySize: 13,
  maxCarrySize: 18,
  ingredient0: { amount: 1, ingredient: MOOMOO_MILK },
  ingredient30: [
    { amount: 2, ingredient: MOOMOO_MILK },
    { amount: 1, ingredient: SOOTHING_CACAO },
  ],
  ingredient60: [
    { amount: 4, ingredient: MOOMOO_MILK },
    { amount: 2, ingredient: SOOTHING_CACAO },
    { amount: 3, ingredient: BEAN_SAUSAGE },
  ],
  skill: INGREDIENT_MAGNET_S,
};

export const JOLTEON: Pokemon = {
  name: 'JOLTEON',
  specialty: 'skill',
  frequency: 2200,
  ingredientPercentage: 15.11,
  skillPercentage: 9.72,
  berry: GREPA,
  carrySize: 17,
  maxCarrySize: 22,
  ingredient0: { amount: 1, ingredient: MOOMOO_MILK },
  ingredient30: [
    { amount: 2, ingredient: MOOMOO_MILK },
    { amount: 1, ingredient: SOOTHING_CACAO },
  ],
  ingredient60: [
    { amount: 4, ingredient: MOOMOO_MILK },
    { amount: 2, ingredient: SOOTHING_CACAO },
    { amount: 3, ingredient: BEAN_SAUSAGE },
  ],
  skill: EXTRA_HELPFUL_S,
};

export const FLAREON: Pokemon = {
  name: 'FLAREON',
  specialty: 'skill',
  frequency: 2700,
  ingredientPercentage: 18.53,
  skillPercentage: 4.767,
  berry: LEPPA,
  carrySize: 14,
  maxCarrySize: 19,
  ingredient0: { amount: 1, ingredient: MOOMOO_MILK },
  ingredient30: [
    { amount: 2, ingredient: MOOMOO_MILK },
    { amount: 1, ingredient: SOOTHING_CACAO },
  ],
  ingredient60: [
    { amount: 4, ingredient: MOOMOO_MILK },
    { amount: 2, ingredient: SOOTHING_CACAO },
    { amount: 3, ingredient: BEAN_SAUSAGE },
  ],
  skill: COOKING_POWER_UP_S,
};

export const AMPHAROS: Pokemon = {
  name: 'AMPHAROS',
  specialty: 'skill',
  frequency: 2500,
  ingredientPercentage: 13,
  skillPercentage: 4.701,
  berry: GREPA,
  carrySize: 15,
  maxCarrySize: 25,
  ingredient0: { amount: 1, ingredient: FIERY_HERB },
  ingredient30: [
    { amount: 2, ingredient: FIERY_HERB },
    { amount: 3, ingredient: FANCY_EGG },
  ],
  ingredient60: [
    { amount: 4, ingredient: FIERY_HERB },
    { amount: 4, ingredient: FANCY_EGG },
  ],
  skill: CHARGE_STRENGTH_M,
};

export const SUDOWOODO: Pokemon = {
  name: 'SUDOWOODO',
  specialty: 'skill',
  frequency: 4000,
  ingredientPercentage: 19.7,
  skillPercentage: 6.505,
  berry: SITRUS,
  carrySize: 10,
  maxCarrySize: 15,
  ingredient0: { amount: 1, ingredient: SNOOZY_TOMATO },
  ingredient30: [
    { amount: 2, ingredient: SNOOZY_TOMATO },
    { amount: 2, ingredient: GREENGRASS_SOYBEANS },
  ],
  ingredient60: [
    { amount: 4, ingredient: SNOOZY_TOMATO },
    { amount: 4, ingredient: GREENGRASS_SOYBEANS },
    { amount: 2, ingredient: TASTY_MUSHROOM },
  ],
  skill: CHARGE_STRENGTH_M,
};

export const ESPEON: Pokemon = {
  name: 'ESPEON',
  specialty: 'skill',
  frequency: 2400,
  ingredientPercentage: 16.37,
  skillPercentage: 4.403,
  berry: MAGO,
  carrySize: 16,
  maxCarrySize: 21,
  ingredient0: { amount: 1, ingredient: MOOMOO_MILK },
  ingredient30: [
    { amount: 2, ingredient: MOOMOO_MILK },
    { amount: 1, ingredient: SOOTHING_CACAO },
  ],
  ingredient60: [
    { amount: 4, ingredient: MOOMOO_MILK },
    { amount: 2, ingredient: SOOTHING_CACAO },
    { amount: 3, ingredient: BEAN_SAUSAGE },
  ],
  skill: CHARGE_STRENGTH_M,
};

export const UMBREON: Pokemon = {
  name: 'UMBREON',
  specialty: 'skill',
  frequency: 3200,
  ingredientPercentage: 21.84,
  skillPercentage: 16.31,
  berry: WIKI,
  carrySize: 14,
  maxCarrySize: 19,
  ingredient0: { amount: 1, ingredient: MOOMOO_MILK },
  ingredient30: [
    { amount: 2, ingredient: MOOMOO_MILK },
    { amount: 1, ingredient: SOOTHING_CACAO },
  ],
  ingredient60: [
    { amount: 4, ingredient: MOOMOO_MILK },
    { amount: 2, ingredient: SOOTHING_CACAO },
    { amount: 3, ingredient: BEAN_SAUSAGE },
  ],
  skill: CHARGE_ENERGY_S,
};

export const SLOWKING: Pokemon = {
  name: 'SLOWKING',
  specialty: 'skill',
  frequency: 3400,
  ingredientPercentage: 15.07,
  skillPercentage: 14.55,
  berry: ORAN,
  carrySize: 11,
  maxCarrySize: 16,
  ingredient0: { amount: 1, ingredient: SOOTHING_CACAO },
  ingredient30: [
    { amount: 2, ingredient: SOOTHING_CACAO },
    { amount: 1, ingredient: SLOWPOKE_TAIL },
  ],
  ingredient60: [
    { amount: 4, ingredient: SOOTHING_CACAO },
    { amount: 2, ingredient: SLOWPOKE_TAIL },
    { amount: 5, ingredient: SNOOZY_TOMATO },
  ],
  skill: ENERGIZING_CHEER_S,
};

export const WOBBUFFET: Pokemon = {
  name: 'WOBBUFFET',
  specialty: 'skill',
  frequency: 3500,
  ingredientPercentage: 21.12,
  skillPercentage: 12.72,
  berry: MAGO,
  carrySize: 10,
  maxCarrySize: 15,
  ingredient0: { amount: 1, ingredient: FANCY_APPLE },
  ingredient30: [
    { amount: 2, ingredient: FANCY_APPLE },
    { amount: 1, ingredient: TASTY_MUSHROOM },
  ],
  ingredient60: [
    { amount: 4, ingredient: FANCY_APPLE },
    { amount: 2, ingredient: TASTY_MUSHROOM },
    { amount: 3, ingredient: PURE_OIL },
  ],
  skill: ENERGIZING_CHEER_S,
};

export const HERACROSS: Pokemon = {
  name: 'HERACROSS',
  specialty: 'skill',
  frequency: 2500,
  ingredientPercentage: 15.8,
  skillPercentage: 4.818,
  berry: LUM,
  carrySize: 15,
  maxCarrySize: 15,
  ingredient0: { amount: 1, ingredient: HONEY },
  ingredient30: [
    { amount: 2, ingredient: HONEY },
    { amount: 1, ingredient: TASTY_MUSHROOM },
  ],
  ingredient60: [
    { amount: 4, ingredient: HONEY },
    { amount: 2, ingredient: TASTY_MUSHROOM },
    { amount: 4, ingredient: BEAN_SAUSAGE },
  ],
  skill: INGREDIENT_MAGNET_S,
};

export const SABLEYE: Pokemon = {
  name: 'SABLEYE',
  specialty: 'skill',
  frequency: 3600,
  ingredientPercentage: 17.06,
  skillPercentage: 7.38,
  berry: WIKI,
  carrySize: 10,
  maxCarrySize: 10,
  ingredient0: { amount: 1, ingredient: PURE_OIL },
  ingredient30: [
    { amount: 2, ingredient: PURE_OIL },
    { amount: 2, ingredient: TASTY_MUSHROOM },
  ],
  ingredient60: [
    { amount: 4, ingredient: PURE_OIL },
    { amount: 3, ingredient: TASTY_MUSHROOM },
    { amount: 3, ingredient: SOOTHING_CACAO },
  ],
  skill: DREAM_SHARD_MAGNET_S_RANGE,
};

export const SWALOT: Pokemon = {
  name: 'SWALOT',
  specialty: 'skill',
  frequency: 3500,
  ingredientPercentage: 21.05,
  skillPercentage: 7.63,
  berry: CHESTO,
  carrySize: 13,
  maxCarrySize: 18,
  ingredient0: { amount: 1, ingredient: GREENGRASS_SOYBEANS },
  ingredient30: [
    { amount: 2, ingredient: GREENGRASS_SOYBEANS },
    { amount: 1, ingredient: TASTY_MUSHROOM },
  ],
  ingredient60: [
    { amount: 4, ingredient: GREENGRASS_SOYBEANS },
    { amount: 2, ingredient: TASTY_MUSHROOM },
    { amount: 4, ingredient: HONEY },
  ],
  skill: DREAM_SHARD_MAGNET_S_RANGE,
};

export const LUCARIO: Pokemon = {
  name: 'LUCARIO',
  specialty: 'skill',
  frequency: 2700,
  ingredientPercentage: 14.93,
  skillPercentage: 6.37,
  berry: CHERI,
  carrySize: 14,
  maxCarrySize: 19,
  ingredient0: { amount: 1, ingredient: PURE_OIL },
  ingredient30: [
    { amount: 2, ingredient: PURE_OIL },
    { amount: 2, ingredient: SOFT_POTATO },
  ],
  ingredient60: [
    { amount: 4, ingredient: PURE_OIL },
    { amount: 4, ingredient: SOFT_POTATO },
    { amount: 4, ingredient: FANCY_EGG },
  ],
  skill: DREAM_SHARD_MAGNET_S,
};

export const MAGNEZONE: Pokemon = {
  name: 'MAGNEZONE',
  specialty: 'skill',
  frequency: 3100,
  ingredientPercentage: 17.92,
  skillPercentage: 5.68,
  berry: BELUE,
  carrySize: 13,
  maxCarrySize: 23,
  ingredient0: { amount: 1, ingredient: PURE_OIL },
  ingredient30: [
    { amount: 2, ingredient: PURE_OIL },
    { amount: 2, ingredient: FIERY_HERB },
  ],
  ingredient60: [
    { amount: 4, ingredient: PURE_OIL },
    { amount: 3, ingredient: FIERY_HERB },
  ],
  skill: COOKING_POWER_UP_S,
};

export const TOGEKISS: Pokemon = {
  name: 'TOGEKISS',
  specialty: 'skill',
  frequency: 2600,
  ingredientPercentage: 15.82,
  skillPercentage: 7.9,
  berry: PECHA,
  carrySize: 16,
  maxCarrySize: 26,
  ingredient0: { amount: 1, ingredient: FANCY_EGG },
  ingredient30: [
    { amount: 2, ingredient: FANCY_EGG },
    { amount: 2, ingredient: WARMING_GINGER },
  ],
  ingredient60: [
    { amount: 4, ingredient: FANCY_EGG },
    { amount: 4, ingredient: WARMING_GINGER },
    { amount: 3, ingredient: SOOTHING_CACAO },
  ],
  skill: METRONOME,
};

export const LEAFEON: Pokemon = {
  name: 'LEAFEON',
  specialty: 'skill',
  frequency: 3000,
  ingredientPercentage: 20.59,
  skillPercentage: 12.94,
  berry: DURIN,
  carrySize: 13,
  maxCarrySize: 18,
  ingredient0: { amount: 1, ingredient: MOOMOO_MILK },
  ingredient30: [
    { amount: 2, ingredient: MOOMOO_MILK },
    { amount: 1, ingredient: SOOTHING_CACAO },
  ],
  ingredient60: [
    { amount: 4, ingredient: MOOMOO_MILK },
    { amount: 2, ingredient: SOOTHING_CACAO },
    { amount: 3, ingredient: BEAN_SAUSAGE },
  ],
  skill: ENERGIZING_CHEER_S,
};

export const GLACEON: Pokemon = {
  name: 'GLACEON',
  specialty: 'skill',
  frequency: 3200,
  ingredientPercentage: 21.82,
  skillPercentage: 5.778,
  berry: RAWST,
  carrySize: 12,
  maxCarrySize: 17,
  ingredient0: { amount: 1, ingredient: MOOMOO_MILK },
  ingredient30: [
    { amount: 2, ingredient: MOOMOO_MILK },
    { amount: 1, ingredient: SOOTHING_CACAO },
  ],
  ingredient60: [
    { amount: 4, ingredient: MOOMOO_MILK },
    { amount: 2, ingredient: SOOTHING_CACAO },
    { amount: 3, ingredient: BEAN_SAUSAGE },
  ],
  skill: COOKING_POWER_UP_S,
};

export const SYLVEON: Pokemon = {
  name: 'SYLVEON',
  specialty: 'skill',
  frequency: 2600,
  ingredientPercentage: 17.8,
  skillPercentage: 6.24,
  berry: PECHA,
  carrySize: 15,
  maxCarrySize: 20,
  ingredient0: { amount: 1, ingredient: MOOMOO_MILK },
  ingredient30: [
    { amount: 2, ingredient: MOOMOO_MILK },
    { amount: 1, ingredient: SOOTHING_CACAO },
  ],
  ingredient60: [
    { amount: 4, ingredient: MOOMOO_MILK },
    { amount: 2, ingredient: SOOTHING_CACAO },
    { amount: 3, ingredient: BEAN_SAUSAGE },
  ],
  skill: ENERGY_FOR_EVERYONE,
};

export const SKILL_SPECIALISTS = [
  PIKACHU_CHRISTMAS,
  WIGGLYTUFF,
  PERSIAN,
  GOLDUCK,
  ARCANINE,
  SLOWBRO,
  VAPOREON,
  JOLTEON,
  FLAREON,
  AMPHAROS,
  SUDOWOODO,
  ESPEON,
  UMBREON,
  SLOWKING,
  WOBBUFFET,
  HERACROSS,
  SABLEYE,
  SWALOT,
  LUCARIO,
  MAGNEZONE,
  TOGEKISS,
  LEAFEON,
  GLACEON,
  SYLVEON,
];
