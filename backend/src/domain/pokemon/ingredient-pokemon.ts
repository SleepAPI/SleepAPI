import {
  BLUK,
  CHESTO,
  DURIN,
  FIGY,
  LEPPA,
  LUM,
  MAGO,
  ORAN,
  PAMTRE,
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
import { CHARGE_ENERGY_S, CHARGE_STRENGTH_S, CHARGE_STRENGTH_S_RANGE, INGREDIENT_MAGNET_S } from '../stat/mainskill';
import { Pokemon } from './pokemon';

export const VENUSAUR: Pokemon = {
  name: 'VENUSAUR',
  specialty: 'ingredient',
  frequency: 2800,
  ingredientPercentage: 26.58,
  skillPercentage: 2.25,
  berry: DURIN,
  carrySize: 17,
  maxCarrySize: 27,
  ingredient0: { amount: 2, ingredient: HONEY },
  ingredient30: [
    { amount: 5, ingredient: HONEY },
    { amount: 4, ingredient: SNOOZY_TOMATO },
  ],
  ingredient60: [
    { amount: 7, ingredient: HONEY },
    { amount: 7, ingredient: SNOOZY_TOMATO },
    { amount: 6, ingredient: SOFT_POTATO },
  ],
  skill: INGREDIENT_MAGNET_S,
};

export const CHARIZARD: Pokemon = {
  name: 'CHARIZARD',
  specialty: 'ingredient',
  frequency: 2400,
  ingredientPercentage: 22.38,
  skillPercentage: 1.717,
  berry: LEPPA,
  carrySize: 19,
  maxCarrySize: 29,
  ingredient0: { amount: 2, ingredient: BEAN_SAUSAGE },
  ingredient30: [
    { amount: 5, ingredient: BEAN_SAUSAGE },
    { amount: 4, ingredient: WARMING_GINGER },
  ],
  ingredient60: [
    { amount: 7, ingredient: BEAN_SAUSAGE },
    { amount: 7, ingredient: WARMING_GINGER },
    { amount: 6, ingredient: FIERY_HERB },
  ],
  skill: INGREDIENT_MAGNET_S,
};

export const BLASTOISE: Pokemon = {
  name: 'BLASTOISE',
  specialty: 'ingredient',
  frequency: 2800,
  ingredientPercentage: 27.46,
  skillPercentage: 2.249,
  berry: ORAN,
  carrySize: 17,
  maxCarrySize: 27,
  ingredient0: { amount: 2, ingredient: MOOMOO_MILK },
  ingredient30: [
    { amount: 5, ingredient: MOOMOO_MILK },
    { amount: 3, ingredient: SOOTHING_CACAO },
  ],
  ingredient60: [
    { amount: 7, ingredient: MOOMOO_MILK },
    { amount: 5, ingredient: SOOTHING_CACAO },
    { amount: 7, ingredient: BEAN_SAUSAGE },
  ],
  skill: INGREDIENT_MAGNET_S,
};

export const DUGTRIO: Pokemon = {
  name: 'DUGTRIO',
  specialty: 'ingredient',
  frequency: 2800,
  ingredientPercentage: 18.96,
  skillPercentage: 2.002,
  berry: FIGY,
  carrySize: 16,
  maxCarrySize: 21,
  ingredient0: { amount: 2, ingredient: SNOOZY_TOMATO },
  ingredient30: [
    { amount: 5, ingredient: SNOOZY_TOMATO },
    { amount: 3, ingredient: LARGE_LEEK },
  ],
  ingredient60: [
    { amount: 7, ingredient: SNOOZY_TOMATO },
    { amount: 4, ingredient: LARGE_LEEK },
    { amount: 8, ingredient: GREENGRASS_SOYBEANS },
  ],
  skill: CHARGE_STRENGTH_S,
};

export const VICTREEBEL: Pokemon = {
  name: 'VICTREEBEL',
  specialty: 'ingredient',
  frequency: 2800,
  ingredientPercentage: 23.3,
  skillPercentage: 4.53,
  berry: DURIN,
  carrySize: 17,
  maxCarrySize: 27,
  ingredient0: { amount: 2, ingredient: SNOOZY_TOMATO },
  ingredient30: [
    { amount: 5, ingredient: SNOOZY_TOMATO },
    { amount: 4, ingredient: SOFT_POTATO },
  ],
  ingredient60: [
    { amount: 7, ingredient: SNOOZY_TOMATO },
    { amount: 6, ingredient: SOFT_POTATO },
    { amount: 4, ingredient: LARGE_LEEK },
  ],
  skill: CHARGE_ENERGY_S,
};

export const GOLEM: Pokemon = {
  name: 'GOLEM',
  specialty: 'ingredient',
  frequency: 3100,
  ingredientPercentage: 28,
  skillPercentage: 2.991,
  berry: SITRUS,
  carrySize: 16,
  maxCarrySize: 26,
  ingredient0: { amount: 2, ingredient: GREENGRASS_SOYBEANS },
  ingredient30: [
    { amount: 5, ingredient: GREENGRASS_SOYBEANS },
    { amount: 4, ingredient: SOFT_POTATO },
  ],
  ingredient60: [
    { amount: 7, ingredient: GREENGRASS_SOYBEANS },
    { amount: 6, ingredient: SOFT_POTATO },
    { amount: 4, ingredient: TASTY_MUSHROOM },
  ],
  skill: CHARGE_STRENGTH_S_RANGE,
};

export const GENGAR: Pokemon = {
  name: 'GENGAR',
  specialty: 'ingredient',
  frequency: 2200,
  ingredientPercentage: 16.1,
  skillPercentage: 1.377,
  berry: BLUK,
  carrySize: 18,
  maxCarrySize: 28,
  ingredient0: { amount: 2, ingredient: FIERY_HERB },
  ingredient30: [
    { amount: 5, ingredient: FIERY_HERB },
    { amount: 4, ingredient: TASTY_MUSHROOM },
  ],
  ingredient60: [
    { amount: 7, ingredient: FIERY_HERB },
    { amount: 6, ingredient: TASTY_MUSHROOM },
    { amount: 8, ingredient: PURE_OIL },
  ],
  skill: CHARGE_STRENGTH_S_RANGE,
};

export const KANGASKHAN: Pokemon = {
  name: 'KANGASKHAN',
  specialty: 'ingredient',
  frequency: 2800,
  ingredientPercentage: 22.21,
  skillPercentage: 1.818,
  berry: PERSIM,
  carrySize: 16,
  maxCarrySize: 16,
  ingredient0: { amount: 2, ingredient: WARMING_GINGER },
  ingredient30: [
    { amount: 5, ingredient: WARMING_GINGER },
    { amount: 4, ingredient: SOFT_POTATO },
  ],
  ingredient60: [
    { amount: 7, ingredient: WARMING_GINGER },
    { amount: 6, ingredient: SOFT_POTATO },
    { amount: 8, ingredient: GREENGRASS_SOYBEANS },
  ],
  skill: INGREDIENT_MAGNET_S,
};

export const MR_MIME: Pokemon = {
  name: 'MR_MIME',
  specialty: 'ingredient',
  frequency: 2800,
  ingredientPercentage: 21.61,
  skillPercentage: 3.873,
  berry: MAGO,
  carrySize: 17,
  maxCarrySize: 22,
  ingredient0: { amount: 2, ingredient: SNOOZY_TOMATO },
  ingredient30: [
    { amount: 5, ingredient: SNOOZY_TOMATO },
    { amount: 4, ingredient: SOFT_POTATO },
  ],
  ingredient60: [
    { amount: 7, ingredient: SNOOZY_TOMATO },
    { amount: 6, ingredient: SOFT_POTATO },
    { amount: 4, ingredient: LARGE_LEEK },
  ],
  skill: CHARGE_STRENGTH_S,
};

export const PINSIR: Pokemon = {
  name: 'PINSIR',
  specialty: 'ingredient',
  frequency: 2400,
  ingredientPercentage: 20.59,
  skillPercentage: 3.101,
  berry: LUM,
  carrySize: 19,
  maxCarrySize: 19,
  ingredient0: { amount: 2, ingredient: HONEY },
  ingredient30: [
    { amount: 5, ingredient: HONEY },
    { amount: 5, ingredient: FANCY_APPLE },
  ],
  ingredient60: [
    { amount: 7, ingredient: HONEY },
    { amount: 8, ingredient: FANCY_APPLE },
    { amount: 7, ingredient: BEAN_SAUSAGE },
  ],
  skill: CHARGE_STRENGTH_S,
};

export const DITTO: Pokemon = {
  name: 'DITTO',
  specialty: 'ingredient',
  frequency: 3500,
  ingredientPercentage: 20.07,
  skillPercentage: 2.073,
  berry: PERSIM,
  carrySize: 13,
  maxCarrySize: 13,
  ingredient0: { amount: 2, ingredient: PURE_OIL },
  ingredient30: [
    { amount: 5, ingredient: PURE_OIL },
    { amount: 3, ingredient: LARGE_LEEK },
  ],
  ingredient60: [
    { amount: 7, ingredient: PURE_OIL },
    { amount: 5, ingredient: LARGE_LEEK },
    { amount: 3, ingredient: SLOWPOKE_TAIL },
  ],
  skill: CHARGE_STRENGTH_S_RANGE,
};

export const DELIBIRD: Pokemon = {
  name: 'DELIBIRD',
  specialty: 'ingredient',
  frequency: 2500,
  ingredientPercentage: 18.81,
  skillPercentage: 2,
  berry: PAMTRE,
  carrySize: 20,
  maxCarrySize: 20,
  ingredient0: { amount: 2, ingredient: FANCY_EGG },
  ingredient30: [
    { amount: 5, ingredient: FANCY_EGG },
    { amount: 6, ingredient: FANCY_APPLE },
  ],
  ingredient60: [
    { amount: 7, ingredient: FANCY_EGG },
    { amount: 9, ingredient: FANCY_APPLE },
    { amount: 5, ingredient: SOOTHING_CACAO },
  ],
  skill: INGREDIENT_MAGNET_S,
};

export const PUPITAR: Pokemon = {
  name: 'PUPITAR',
  specialty: 'ingredient',
  frequency: 3600,
  ingredientPercentage: 24.71,
  skillPercentage: 5.2,
  berry: SITRUS,
  carrySize: 13,
  maxCarrySize: 18,
  ingredient0: { amount: 2, ingredient: WARMING_GINGER },
  ingredient30: [
    { amount: 5, ingredient: WARMING_GINGER },
    { amount: 5, ingredient: GREENGRASS_SOYBEANS },
  ],
  ingredient60: [
    { amount: 7, ingredient: WARMING_GINGER },
    { amount: 8, ingredient: GREENGRASS_SOYBEANS },
    { amount: 8, ingredient: BEAN_SAUSAGE },
  ],
  skill: CHARGE_ENERGY_S,
};

export const TYRANITAR: Pokemon = {
  name: 'TYRANITAR',
  specialty: 'ingredient',
  frequency: 2700,
  ingredientPercentage: 26.6,
  skillPercentage: 6.32,
  berry: WIKI,
  carrySize: 19,
  maxCarrySize: 29,
  ingredient0: { amount: 2, ingredient: WARMING_GINGER },
  ingredient30: [
    { amount: 5, ingredient: WARMING_GINGER },
    { amount: 5, ingredient: GREENGRASS_SOYBEANS },
  ],
  ingredient60: [
    { amount: 7, ingredient: WARMING_GINGER },
    { amount: 8, ingredient: GREENGRASS_SOYBEANS },
    { amount: 8, ingredient: BEAN_SAUSAGE },
  ],
  skill: CHARGE_ENERGY_S,
};

export const ABSOL: Pokemon = {
  name: 'ABSOL',
  specialty: 'ingredient',
  frequency: 3100,
  ingredientPercentage: 17.78,
  skillPercentage: 3.803,
  berry: WIKI,
  carrySize: 14,
  maxCarrySize: 14,
  ingredient0: { amount: 2, ingredient: SOOTHING_CACAO },
  ingredient30: [
    { amount: 5, ingredient: SOOTHING_CACAO },
    { amount: 8, ingredient: FANCY_APPLE },
  ],
  ingredient60: [
    { amount: 7, ingredient: SOOTHING_CACAO },
    { amount: 12, ingredient: FANCY_APPLE },
    { amount: 7, ingredient: TASTY_MUSHROOM },
  ],
  skill: CHARGE_STRENGTH_S,
};

export const TOXICROAK: Pokemon = {
  name: 'TOXICROAK',
  specialty: 'ingredient',
  frequency: 3400,
  ingredientPercentage: 22.87,
  skillPercentage: 4.296,
  berry: CHESTO,
  carrySize: 14,
  maxCarrySize: 19,
  ingredient0: { amount: 2, ingredient: PURE_OIL },
  ingredient30: [
    { amount: 5, ingredient: PURE_OIL },
    { amount: 5, ingredient: BEAN_SAUSAGE },
  ],
  ingredient60: [
    { amount: 7, ingredient: PURE_OIL },
    { amount: 8, ingredient: BEAN_SAUSAGE },
  ],
  skill: CHARGE_STRENGTH_S,
};

export const ABOMASNOW: Pokemon = {
  name: 'ABOMASNOW',
  specialty: 'ingredient',
  frequency: 3000,
  ingredientPercentage: 25.01,
  skillPercentage: 2,
  berry: RAWST,
  carrySize: 21,
  maxCarrySize: 26,
  ingredient0: { amount: 2, ingredient: SNOOZY_TOMATO },
  ingredient30: [
    { amount: 5, ingredient: SNOOZY_TOMATO },
    { amount: 4, ingredient: FANCY_EGG },
  ],
  ingredient60: [
    { amount: 7, ingredient: SNOOZY_TOMATO },
    { amount: 7, ingredient: FANCY_EGG },
    { amount: 5, ingredient: TASTY_MUSHROOM },
  ],
  skill: CHARGE_STRENGTH_S_RANGE,
};

export const INGREDIENT_SPECIALISTS = [
  ABOMASNOW,
  VENUSAUR,
  GOLEM,
  BLASTOISE,
  VICTREEBEL,
  ABSOL,
  GENGAR,
  DITTO,
  DUGTRIO,
  DELIBIRD,
  PUPITAR,
  TYRANITAR,
  KANGASKHAN,
  CHARIZARD,
  PINSIR,
  TOXICROAK,
  MR_MIME,
];
