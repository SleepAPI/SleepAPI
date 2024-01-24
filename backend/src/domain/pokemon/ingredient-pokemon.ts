import { toSeconds } from '../../utils/time-utils/time-utils';
import {
  BLUK,
  CHERI,
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
  YACHE,
} from '../produce/berry';
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
} from '../produce/ingredient';
import { CHARGE_ENERGY_S, CHARGE_STRENGTH_S, CHARGE_STRENGTH_S_RANGE, INGREDIENT_MAGNET_S } from '../stat/mainskill';
import { Pokemon } from './pokemon';

export const BULBASAUR: Pokemon = {
  name: 'BULBASAUR',
  specialty: 'ingredient',
  frequency: toSeconds(1, 13, 20),
  ingredientPercentage: 25.71,
  skillPercentage: 0,
  berry: DURIN,
  carrySize: 11,
  maxCarrySize: 11,
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

export const IVYSAUR: Pokemon = {
  ...BULBASAUR,
  name: 'IVYSAUR',
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 25.49,
  skillPercentage: 0,
  carrySize: 14,
  maxCarrySize: 19,
};

export const VENUSAUR: Pokemon = {
  ...BULBASAUR,
  name: 'VENUSAUR',
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 26.58,
  skillPercentage: 2.25,
  carrySize: 17,
  maxCarrySize: 27,
};

export const CHARMANDER: Pokemon = {
  name: 'CHARMANDER',
  specialty: 'ingredient',
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 20.09,
  skillPercentage: 0,
  berry: LEPPA,
  carrySize: 12,
  maxCarrySize: 12,
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

export const CHARMELEON: Pokemon = {
  ...CHARMANDER,
  name: 'CHARMELEON',
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 22.72,
  skillPercentage: 0,
  carrySize: 15,
  maxCarrySize: 20,
};

export const CHARIZARD: Pokemon = {
  ...CHARMANDER,
  name: 'CHARIZARD',
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 22.38,
  skillPercentage: 1.717,
  carrySize: 19,
  maxCarrySize: 29,
};

export const SQUIRTLE: Pokemon = {
  name: 'SQUIRTLE',
  specialty: 'ingredient',
  frequency: toSeconds(1, 15, 0),
  ingredientPercentage: 27.09,
  skillPercentage: 0,
  berry: ORAN,
  carrySize: 10,
  maxCarrySize: 10,
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

export const WARTORTLE: Pokemon = {
  ...SQUIRTLE,
  name: 'WARTORTLE',
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 27.09,
  skillPercentage: 0,
  carrySize: 14,
  maxCarrySize: 19,
};

export const BLASTOISE: Pokemon = {
  ...SQUIRTLE,
  name: 'BLASTOISE',
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 27.46,
  skillPercentage: 2.249,
  carrySize: 17,
  maxCarrySize: 27,
};

export const DIGLETT: Pokemon = {
  name: 'DIGLETT',
  specialty: 'ingredient',
  frequency: toSeconds(1, 11, 40),
  ingredientPercentage: 19.2,
  skillPercentage: 0,
  berry: FIGY,
  carrySize: 10,
  maxCarrySize: 10,
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

export const DUGTRIO: Pokemon = {
  ...DIGLETT,
  name: 'DUGTRIO',
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 18.96,
  skillPercentage: 2.002,
  carrySize: 16,
  maxCarrySize: 21,
};

export const BELLSPROUT: Pokemon = {
  name: 'BELLSPROUT',
  specialty: 'ingredient',
  frequency: toSeconds(1, 26, 40),
  ingredientPercentage: 23.28,
  skillPercentage: 0,
  berry: DURIN,
  carrySize: 8,
  maxCarrySize: 8,
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

export const WEEPINBELL: Pokemon = {
  ...BELLSPROUT,
  name: 'WEEPINBELL',
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 23.5,
  skillPercentage: 0,
  carrySize: 12,
  maxCarrySize: 17,
};

export const VICTREEBEL: Pokemon = {
  ...BELLSPROUT,
  name: 'VICTREEBEL',
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 23.3,
  skillPercentage: 4.53,
  carrySize: 17,
  maxCarrySize: 27,
};

export const GEODUDE: Pokemon = {
  name: 'GEODUDE',
  specialty: 'ingredient',
  frequency: toSeconds(1, 35, 0),
  ingredientPercentage: 28.1,
  skillPercentage: 0,
  berry: SITRUS,
  carrySize: 9,
  maxCarrySize: 9,
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

export const GRAVELER: Pokemon = {
  ...GEODUDE,
  name: 'GRAVELER',
  frequency: toSeconds(1, 6, 40),
  ingredientPercentage: 27.21,
  skillPercentage: 0,
  carrySize: 12,
  maxCarrySize: 17,
};

export const GOLEM: Pokemon = {
  ...GEODUDE,
  name: 'GOLEM',
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 28,
  skillPercentage: 2.991,
  carrySize: 16,
  maxCarrySize: 26,
};

export const GASTLY: Pokemon = {
  name: 'GASTLY',
  specialty: 'ingredient',
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 14.4,
  skillPercentage: 0,
  berry: BLUK,
  carrySize: 10,
  maxCarrySize: 10,
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

export const HAUNTER: Pokemon = {
  ...GASTLY,
  name: 'HAUNTER',
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 15.7,
  skillPercentage: 0,
  carrySize: 14,
  maxCarrySize: 19,
};

export const GENGAR: Pokemon = {
  ...GASTLY,
  name: 'GENGAR',
  frequency: toSeconds(0, 36, 40),
  ingredientPercentage: 16.1,
  skillPercentage: 1.377,
  carrySize: 18,
  maxCarrySize: 28,
};

export const KANGASKHAN: Pokemon = {
  name: 'KANGASKHAN',
  specialty: 'ingredient',
  frequency: toSeconds(0, 46, 40),
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
  frequency: toSeconds(0, 46, 40),
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
  frequency: toSeconds(0, 40, 0),
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
  frequency: toSeconds(0, 58, 20),
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
export const DRATINI: Pokemon = {
  name: 'DRATINI',
  specialty: 'ingredient',
  frequency: toSeconds(1, 23, 20),
  ingredientPercentage: 22, // TODO: missing
  skillPercentage: 2, // TODO: missing
  berry: YACHE,
  carrySize: 9,
  maxCarrySize: 9,
  ingredient0: { amount: 2, ingredient: FIERY_HERB },
  ingredient30: [
    { amount: 5, ingredient: FIERY_HERB },
    { amount: 4, ingredient: GREENGRASS_CORN },
  ],
  ingredient60: [
    { amount: 7, ingredient: FIERY_HERB },
    { amount: 7, ingredient: GREENGRASS_CORN },
    { amount: 8, ingredient: PURE_OIL },
  ],
  skill: CHARGE_STRENGTH_S,
};

export const DRAGONAIR: Pokemon = {
  ...DRATINI,
  name: 'DRAGONAIR',
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 22, // TODO: missing
  skillPercentage: 2, // TODO: missing
  carrySize: 12,
  maxCarrySize: 17,
};

export const DRAGONITE: Pokemon = {
  ...DRATINI,
  name: 'DRAGONITE',
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 22, // TODO: missing
  skillPercentage: 2, // TODO: missing
  carrySize: 20,
  maxCarrySize: 30,
};

export const DELIBIRD: Pokemon = {
  name: 'DELIBIRD',
  specialty: 'ingredient',
  frequency: toSeconds(0, 41, 40),
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

export const LARVITAR: Pokemon = {
  name: 'LARVITAR',
  specialty: 'ingredient',
  frequency: toSeconds(1, 20, 0),
  ingredientPercentage: 23.79,
  skillPercentage: 0,
  berry: SITRUS,
  carrySize: 9,
  maxCarrySize: 9,
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

export const PUPITAR: Pokemon = {
  ...LARVITAR,
  name: 'PUPITAR',
  frequency: toSeconds(1, 0, 0),
  ingredientPercentage: 24.71,
  skillPercentage: 5.2,
  carrySize: 13,
  maxCarrySize: 18,
};

export const TYRANITAR: Pokemon = {
  ...LARVITAR,
  name: 'TYRANITAR',
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 26.6,
  skillPercentage: 6.32,
  berry: WIKI,
  carrySize: 19,
  maxCarrySize: 29,
};

export const ABSOL: Pokemon = {
  name: 'ABSOL',
  specialty: 'ingredient',
  frequency: toSeconds(0, 51, 40),
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

export const MIME_JR: Pokemon = {
  ...MR_MIME,
  name: 'MIME_JR',
  frequency: toSeconds(1, 11, 40),
  ingredientPercentage: 20.11,
  skillPercentage: 0,
  carrySize: 7,
  maxCarrySize: 7,
};

export const CROAGUNK: Pokemon = {
  name: 'CROAGUNK',
  specialty: 'ingredient',
  frequency: toSeconds(1, 33, 20),
  ingredientPercentage: 22.78,
  skillPercentage: 0,
  berry: CHESTO,
  carrySize: 10,
  maxCarrySize: 10,
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

export const TOXICROAK: Pokemon = {
  ...CROAGUNK,
  name: 'TOXICROAK',
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 22.87,
  skillPercentage: 4.296,
  carrySize: 14,
  maxCarrySize: 19,
};

export const SNOVER: Pokemon = {
  name: 'SNOVER',
  specialty: 'ingredient',
  frequency: toSeconds(1, 33, 20),
  ingredientPercentage: 25.1,
  skillPercentage: 0,
  berry: RAWST,
  carrySize: 10,
  maxCarrySize: 10,
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

export const ABOMASNOW: Pokemon = {
  ...SNOVER,
  name: 'ABOMASNOW',
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 25.01,
  skillPercentage: 2,
  carrySize: 21,
  maxCarrySize: 26,
};

export const STUFFUL: Pokemon = {
  name: 'STUFFUL',
  specialty: 'ingredient',
  frequency: toSeconds(1, 8, 20),
  ingredientPercentage: 22, // TODO: missing
  skillPercentage: 0, // TODO: missing
  berry: CHERI,
  carrySize: 13,
  maxCarrySize: 13,
  ingredient0: { amount: 2, ingredient: GREENGRASS_CORN },
  ingredient30: [
    { amount: 5, ingredient: GREENGRASS_CORN },
    { amount: 6, ingredient: BEAN_SAUSAGE },
  ],
  ingredient60: [
    { amount: 7, ingredient: GREENGRASS_CORN },
    { amount: 10, ingredient: BEAN_SAUSAGE },
    { amount: 9, ingredient: FANCY_EGG },
  ],
  skill: CHARGE_STRENGTH_S_RANGE,
};

export const BEWEAR: Pokemon = {
  ...STUFFUL,
  name: 'BEWEAR',
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 22, // TODO: missing
  skillPercentage: 2, // TODO: missing
  carrySize: 20,
  maxCarrySize: 25,
};

// TODO: re-order
export const OPTIMAL_INGREDIENT_SPECIALISTS: Pokemon[] = [
  VENUSAUR,
  CHARIZARD,
  BLASTOISE,
  DUGTRIO,
  VICTREEBEL,
  GOLEM,
  GENGAR,
  KANGASKHAN,
  MR_MIME,
  PINSIR,
  DITTO,
  DRAGONITE,
  DELIBIRD,
  PUPITAR,
  TYRANITAR,
  ABSOL,
  TOXICROAK,
  ABOMASNOW,
  BEWEAR,
];

export const INFERIOR_INGREDIENT_SPECIALISTS: Pokemon[] = [
  BULBASAUR,
  IVYSAUR,
  CHARMANDER,
  CHARMELEON,
  SQUIRTLE,
  WARTORTLE,
  DIGLETT,
  BELLSPROUT,
  WEEPINBELL,
  GEODUDE,
  GRAVELER,
  GASTLY,
  HAUNTER,
  DRATINI,
  DRAGONAIR,
  LARVITAR,
  MIME_JR,
  CROAGUNK,
  SNOVER,
  STUFFUL,
];

export const ALL_INGREDIENT_SPECIALISTS: Pokemon[] = [
  ...OPTIMAL_INGREDIENT_SPECIALISTS,
  ...INFERIOR_INGREDIENT_SPECIALISTS,
];
