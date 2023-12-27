import {
  BELUE,
  BLUK,
  CHERI,
  CHESTO,
  DURIN,
  FIGY,
  GREPA,
  LEPPA,
  LUM,
  ORAN,
  PAMTRE,
  PECHA,
  PERSIM,
  RAWST,
  SITRUS,
  WIKI,
  YACHE,
} from '../produce/berry';
import {
  BEAN_SAUSAGE,
  FANCY_APPLE,
  FANCY_EGG,
  FIERY_HERB,
  GREENGRASS_SOYBEANS,
  HONEY,
  LARGE_LEEK,
  PURE_OIL,
  SNOOZY_TOMATO,
  SOFT_POTATO,
  SOOTHING_CACAO,
  TASTY_MUSHROOM,
  WARMING_GINGER,
} from '../produce/ingredient';
import {
  CHARGE_ENERGY_S,
  CHARGE_STRENGTH_S,
  CHARGE_STRENGTH_S_RANGE,
  INGREDIENT_MAGNET_S,
  METRONOME,
} from '../stat/mainskill';
import { Pokemon } from './pokemon';

export const BUTTERFREE: Pokemon = {
  name: 'BUTTERFREE',
  specialty: 'berry',
  frequency: 2600,
  ingredientPercentage: 19.72,
  skillPercentage: 1.499,
  berry: LUM,
  carrySize: 21,
  maxCarrySize: 31,
  ingredient0: { amount: 1, ingredient: HONEY },
  ingredient30: [
    { amount: 2, ingredient: HONEY },
    { amount: 2, ingredient: SNOOZY_TOMATO },
  ],
  ingredient60: [
    { amount: 4, ingredient: HONEY },
    { amount: 3, ingredient: SNOOZY_TOMATO },
    { amount: 4, ingredient: GREENGRASS_SOYBEANS },
  ],
  skill: INGREDIENT_MAGNET_S,
};
export const RATICATE: Pokemon = {
  name: 'RATICATE',
  specialty: 'berry',
  frequency: 3200,
  ingredientPercentage: 23.67,
  skillPercentage: 3.48,
  berry: PERSIM,
  carrySize: 16,
  maxCarrySize: 21,
  ingredient0: { amount: 1, ingredient: FANCY_APPLE },
  ingredient30: [
    { amount: 2, ingredient: FANCY_APPLE },
    { amount: 2, ingredient: GREENGRASS_SOYBEANS },
  ],
  ingredient60: [
    { amount: 4, ingredient: FANCY_APPLE },
    { amount: 3, ingredient: GREENGRASS_SOYBEANS },
    { amount: 3, ingredient: BEAN_SAUSAGE },
  ],
  skill: CHARGE_ENERGY_S,
};

export const ARBOK: Pokemon = {
  name: 'ARBOK',
  specialty: 'berry',
  frequency: 3700,
  ingredientPercentage: 26.34,
  skillPercentage: 6.62,
  berry: CHESTO,
  carrySize: 14,
  maxCarrySize: 19,
  ingredient0: { amount: 1, ingredient: BEAN_SAUSAGE },
  ingredient30: [
    { amount: 2, ingredient: BEAN_SAUSAGE },
    { amount: 2, ingredient: FANCY_EGG },
  ],
  ingredient60: [
    { amount: 4, ingredient: BEAN_SAUSAGE },
    { amount: 3, ingredient: FANCY_EGG },
    { amount: 3, ingredient: FIERY_HERB },
  ],
  skill: CHARGE_ENERGY_S,
};

export const PIKACHU_HALLOWEEN: Pokemon = {
  name: 'PIKACHU_HALLOWEEN',
  specialty: 'berry',
  frequency: 2600,
  ingredientPercentage: 21.87,
  skillPercentage: 2,
  berry: GREPA,
  carrySize: 18,
  maxCarrySize: 18,
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
  skill: CHARGE_STRENGTH_S_RANGE,
};

export const RAICHU: Pokemon = {
  name: 'RAICHU',
  specialty: 'berry',
  frequency: 2200,
  ingredientPercentage: 22.42,
  skillPercentage: 3.193,
  berry: GREPA,
  carrySize: 21,
  maxCarrySize: 31,
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
  skill: CHARGE_ENERGY_S,
};

export const CLEFABLE: Pokemon = {
  name: 'CLEFABLE',
  specialty: 'berry',
  frequency: 2800,
  ingredientPercentage: 16.79,
  skillPercentage: 5.37,
  berry: PECHA,
  carrySize: 24,
  maxCarrySize: 34,
  ingredient0: { amount: 1, ingredient: FANCY_APPLE },
  ingredient30: [
    { amount: 2, ingredient: FANCY_APPLE },
    { amount: 2, ingredient: HONEY },
  ],
  ingredient60: [
    { amount: 4, ingredient: FANCY_APPLE },
    { amount: 3, ingredient: HONEY },
    { amount: 3, ingredient: GREENGRASS_SOYBEANS },
  ],
  skill: METRONOME,
};

export const PRIMEAPE: Pokemon = {
  name: 'PRIMEAPE',
  specialty: 'berry',
  frequency: 2800,
  ingredientPercentage: 20.01,
  skillPercentage: 1.379,
  berry: CHERI,
  carrySize: 17,
  maxCarrySize: 22,
  ingredient0: { amount: 1, ingredient: BEAN_SAUSAGE },
  ingredient30: [
    { amount: 2, ingredient: BEAN_SAUSAGE },
    { amount: 1, ingredient: TASTY_MUSHROOM },
  ],
  ingredient60: [
    { amount: 4, ingredient: BEAN_SAUSAGE },
    { amount: 2, ingredient: TASTY_MUSHROOM },
    { amount: 4, ingredient: HONEY },
  ],
  skill: CHARGE_STRENGTH_S_RANGE,
};

export const DODRIO: Pokemon = {
  name: 'DODRIO',
  specialty: 'berry',
  frequency: 2400,
  ingredientPercentage: 18.41,
  skillPercentage: 2.32,
  berry: PAMTRE,
  carrySize: 21,
  maxCarrySize: 26,
  ingredient0: { amount: 1, ingredient: GREENGRASS_SOYBEANS },
  ingredient30: [
    { amount: 2, ingredient: GREENGRASS_SOYBEANS },
    { amount: 1, ingredient: SOOTHING_CACAO },
  ],
  ingredient60: [
    { amount: 4, ingredient: GREENGRASS_SOYBEANS },
    { amount: 2, ingredient: SOOTHING_CACAO },
    { amount: 3, ingredient: BEAN_SAUSAGE },
  ],

  skill: CHARGE_ENERGY_S,
};

export const ONIX: Pokemon = {
  name: 'ONIX',
  specialty: 'berry',
  frequency: 3100,
  ingredientPercentage: 13.19,
  skillPercentage: 2.462,
  berry: SITRUS,
  carrySize: 22,
  maxCarrySize: 22,
  ingredient0: { amount: 1, ingredient: SNOOZY_TOMATO },
  ingredient30: [
    { amount: 2, ingredient: SNOOZY_TOMATO },
    { amount: 2, ingredient: BEAN_SAUSAGE },
  ],
  ingredient60: [
    { amount: 4, ingredient: SNOOZY_TOMATO },
    { amount: 4, ingredient: BEAN_SAUSAGE },
    { amount: 3, ingredient: SOFT_POTATO },
  ],
  skill: INGREDIENT_MAGNET_S,
};

export const MAROWAK: Pokemon = {
  name: 'MAROWAK',
  specialty: 'berry',
  frequency: 3500,
  ingredientPercentage: 22.47,
  skillPercentage: 5.23,
  berry: FIGY,
  carrySize: 15,
  maxCarrySize: 20,
  ingredient0: { amount: 1, ingredient: WARMING_GINGER },
  ingredient30: [
    { amount: 2, ingredient: WARMING_GINGER },
    { amount: 2, ingredient: SOOTHING_CACAO },
  ],
  ingredient60: [
    { amount: 4, ingredient: WARMING_GINGER },
    { amount: 3, ingredient: SOOTHING_CACAO },
  ],
  skill: CHARGE_ENERGY_S,
};

export const MEGANIUM: Pokemon = {
  name: 'MEGANIUM',
  specialty: 'berry',
  frequency: 2800,
  ingredientPercentage: 17.41,
  skillPercentage: 2.646,
  berry: DURIN,
  carrySize: 20,
  maxCarrySize: 30,
  ingredient0: { amount: 1, ingredient: SOOTHING_CACAO },
  ingredient30: [
    { amount: 2, ingredient: SOOTHING_CACAO },
    { amount: 3, ingredient: HONEY },
  ],
  ingredient60: [
    { amount: 4, ingredient: SOOTHING_CACAO },
    { amount: 5, ingredient: HONEY },
    { amount: 3, ingredient: LARGE_LEEK },
  ],
  skill: CHARGE_STRENGTH_S_RANGE,
};

export const TYPHLOSION: Pokemon = {
  name: 'TYPHLOSION',
  specialty: 'berry',
  frequency: 2400,
  ingredientPercentage: 20.58,
  skillPercentage: 2.244,
  berry: LEPPA,
  carrySize: 23,
  maxCarrySize: 33,
  ingredient0: { amount: 1, ingredient: WARMING_GINGER },
  ingredient30: [
    { amount: 2, ingredient: WARMING_GINGER },
    { amount: 2, ingredient: FIERY_HERB },
  ],
  ingredient60: [
    { amount: 4, ingredient: WARMING_GINGER },
    { amount: 3, ingredient: FIERY_HERB },
    { amount: 3, ingredient: PURE_OIL },
  ],
  skill: CHARGE_STRENGTH_S_RANGE,
};

export const FERALIGATR: Pokemon = {
  name: 'FERALIGATR',
  specialty: 'berry',
  frequency: 2800,
  ingredientPercentage: 25.6,
  skillPercentage: 3.159,
  berry: ORAN,
  carrySize: 19,
  maxCarrySize: 29,
  ingredient0: { amount: 1, ingredient: BEAN_SAUSAGE },
  ingredient30: [
    { amount: 2, ingredient: BEAN_SAUSAGE },
    { amount: 2, ingredient: PURE_OIL },
  ],
  ingredient60: [
    { amount: 4, ingredient: BEAN_SAUSAGE },
    { amount: 3, ingredient: PURE_OIL },
  ],
  skill: CHARGE_STRENGTH_S_RANGE,
};

export const STEELIX: Pokemon = {
  name: 'STEELIX',
  specialty: 'berry',
  frequency: 3000,
  ingredientPercentage: 15.41,
  skillPercentage: 3.426,
  berry: BELUE,
  carrySize: 25,
  maxCarrySize: 30,
  ingredient0: { amount: 1, ingredient: SNOOZY_TOMATO },
  ingredient30: [
    { amount: 2, ingredient: SNOOZY_TOMATO },
    { amount: 2, ingredient: BEAN_SAUSAGE },
  ],
  ingredient60: [
    { amount: 4, ingredient: SNOOZY_TOMATO },
    { amount: 4, ingredient: BEAN_SAUSAGE },
    { amount: 3, ingredient: SOFT_POTATO },
  ],
  skill: INGREDIENT_MAGNET_S,
};

export const HOUNDOOM: Pokemon = {
  name: 'HOUNDOOM',
  specialty: 'berry',
  frequency: 3300,
  ingredientPercentage: 20.24,
  skillPercentage: 4.592,
  berry: WIKI,
  carrySize: 16,
  maxCarrySize: 21,
  ingredient0: { amount: 1, ingredient: FIERY_HERB },
  ingredient30: [
    { amount: 2, ingredient: FIERY_HERB },
    { amount: 3, ingredient: WARMING_GINGER },
  ],
  ingredient60: [
    { amount: 4, ingredient: FIERY_HERB },
    { amount: 4, ingredient: WARMING_GINGER },
    { amount: 3, ingredient: LARGE_LEEK },
  ],
  skill: CHARGE_STRENGTH_S,
};

export const VIGOROTH: Pokemon = {
  name: 'VIGOROTH',
  specialty: 'berry',
  frequency: 3800,
  ingredientPercentage: 20.44,
  skillPercentage: 1.606,
  berry: PERSIM,
  carrySize: 9,
  maxCarrySize: 14,
  ingredient0: { amount: 1, ingredient: SNOOZY_TOMATO },
  ingredient30: [
    { amount: 2, ingredient: SNOOZY_TOMATO },
    { amount: 2, ingredient: HONEY },
  ],
  ingredient60: [
    { amount: 4, ingredient: SNOOZY_TOMATO },
    { amount: 4, ingredient: HONEY },
    { amount: 4, ingredient: FANCY_APPLE },
  ],
  skill: INGREDIENT_MAGNET_S,
};

export const SLAKING: Pokemon = {
  name: 'SLAKING',
  specialty: 'berry',
  frequency: 3800,
  ingredientPercentage: 33.96,
  skillPercentage: 7.179,
  berry: PERSIM,
  carrySize: 12,
  maxCarrySize: 22,
  ingredient0: { amount: 1, ingredient: SNOOZY_TOMATO },
  ingredient30: [
    { amount: 2, ingredient: SNOOZY_TOMATO },
    { amount: 2, ingredient: HONEY },
  ],
  ingredient60: [
    { amount: 4, ingredient: SNOOZY_TOMATO },
    { amount: 4, ingredient: HONEY },
    { amount: 4, ingredient: FANCY_APPLE },
  ],
  skill: INGREDIENT_MAGNET_S,
};

export const ALTARIA: Pokemon = {
  name: 'ALTARIA',
  specialty: 'berry',
  frequency: 3700,
  ingredientPercentage: 25.67,
  skillPercentage: 7.1,
  berry: YACHE,
  carrySize: 14,
  maxCarrySize: 19,
  ingredient0: { amount: 1, ingredient: FANCY_EGG },
  ingredient30: [
    { amount: 2, ingredient: FANCY_EGG },
    { amount: 3, ingredient: GREENGRASS_SOYBEANS },
  ],
  ingredient60: [
    { amount: 4, ingredient: FANCY_EGG },
    { amount: 4, ingredient: GREENGRASS_SOYBEANS },
    { amount: 5, ingredient: FANCY_APPLE },
  ],
  skill: CHARGE_ENERGY_S,
};

export const BANETTE: Pokemon = {
  name: 'BANETTE',
  specialty: 'berry',
  frequency: 2600,
  ingredientPercentage: 17.9,
  skillPercentage: 1.899,
  berry: BLUK,
  carrySize: 19,
  maxCarrySize: 24,
  ingredient0: { amount: 1, ingredient: PURE_OIL },
  ingredient30: [
    { amount: 2, ingredient: PURE_OIL },
    { amount: 2, ingredient: WARMING_GINGER },
  ],
  ingredient60: [
    { amount: 4, ingredient: PURE_OIL },
    { amount: 4, ingredient: WARMING_GINGER },
    { amount: 3, ingredient: TASTY_MUSHROOM },
  ],
  skill: CHARGE_STRENGTH_S_RANGE,
};

export const WALREIN: Pokemon = {
  name: 'WALREIN',
  specialty: 'berry',
  frequency: 3000,
  ingredientPercentage: 22.4,
  skillPercentage: 2.353,
  berry: RAWST,
  carrySize: 18,
  maxCarrySize: 28,
  ingredient0: { amount: 1, ingredient: PURE_OIL },
  ingredient30: [
    { amount: 2, ingredient: PURE_OIL },
    { amount: 3, ingredient: BEAN_SAUSAGE },
  ],
  ingredient60: [
    { amount: 4, ingredient: PURE_OIL },
    { amount: 4, ingredient: BEAN_SAUSAGE },
    { amount: 4, ingredient: WARMING_GINGER },
  ],
  skill: INGREDIENT_MAGNET_S,
};

export const BERRY_SPECIALISTS = [
  BUTTERFREE,
  RATICATE,
  ARBOK,
  PIKACHU_HALLOWEEN,
  RAICHU,
  CLEFABLE,
  PRIMEAPE,
  DODRIO,
  ONIX,
  MAROWAK,
  MEGANIUM,
  TYPHLOSION,
  FERALIGATR,
  STEELIX,
  HOUNDOOM,
  VIGOROTH,
  SLAKING,
  ALTARIA,
  BANETTE,
  WALREIN,
];
