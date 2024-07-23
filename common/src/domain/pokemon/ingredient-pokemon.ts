import { evolvesFrom, evolvesInto } from '../../utils/pokemon-utils/evolution-utils';
import { toSeconds } from '../../utils/time-utils/frequency-utils';
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
  PECHA,
  PERSIM,
  RAWST,
  SITRUS,
  WIKI,
  YACHE,
} from '../berry/berry';
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
import {
  CHARGE_ENERGY_S,
  CHARGE_STRENGTH_M,
  CHARGE_STRENGTH_S,
  CHARGE_STRENGTH_S_RANGE,
  COOKING_POWER_UP_S,
  ENERGIZING_CHEER_S,
  INGREDIENT_MAGNET_S,
  TASTY_CHANCE_S,
} from '../mainskill/mainskill';
import { Pokemon } from './pokemon';

export const BULBASAUR: Pokemon = {
  name: 'BULBASAUR',
  specialty: 'ingredient',
  frequency: toSeconds(1, 13, 20),
  ingredientPercentage: 25.7,
  skillPercentage: 1.9,
  berry: DURIN,
  carrySize: 11,
  maxCarrySize: 11,
  remainingEvolutions: 2,
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
  ...evolvesFrom(BULBASAUR),
  name: 'IVYSAUR',
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 25.5,
  skillPercentage: 1.9,
  carrySize: 14,
  maxCarrySize: 19,
};

export const VENUSAUR: Pokemon = {
  ...evolvesFrom(IVYSAUR),
  name: 'VENUSAUR',
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 26.6,
  skillPercentage: 2.1,
  carrySize: 17,
  maxCarrySize: 27,
};

export const CHARMANDER: Pokemon = {
  name: 'CHARMANDER',
  specialty: 'ingredient',
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 20.1,
  skillPercentage: 1.1,
  berry: LEPPA,
  carrySize: 12,
  maxCarrySize: 12,
  remainingEvolutions: 2,
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
  ...evolvesFrom(CHARMANDER),
  name: 'CHARMELEON',
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 22.7,
  skillPercentage: 1.6,
  carrySize: 15,
  maxCarrySize: 20,
};

export const CHARIZARD: Pokemon = {
  ...evolvesFrom(CHARMELEON),
  name: 'CHARIZARD',
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 22.4,
  skillPercentage: 1.6,
  carrySize: 19,
  maxCarrySize: 29,
};

export const SQUIRTLE: Pokemon = {
  name: 'SQUIRTLE',
  specialty: 'ingredient',
  frequency: toSeconds(1, 15, 0),
  ingredientPercentage: 27.1,
  skillPercentage: 2.0,
  berry: ORAN,
  carrySize: 10,
  maxCarrySize: 10,
  remainingEvolutions: 2,
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
  ...evolvesFrom(SQUIRTLE),
  name: 'WARTORTLE',
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 27.1,
  skillPercentage: 2.0,
  carrySize: 14,
  maxCarrySize: 19,
};

export const BLASTOISE: Pokemon = {
  ...evolvesFrom(WARTORTLE),
  name: 'BLASTOISE',
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 27.5,
  skillPercentage: 2.1,
  carrySize: 17,
  maxCarrySize: 27,
};

export const DIGLETT: Pokemon = {
  name: 'DIGLETT',
  specialty: 'ingredient',
  frequency: toSeconds(1, 11, 40),
  ingredientPercentage: 19.2,
  skillPercentage: 2.1,
  berry: FIGY,
  carrySize: 10,
  maxCarrySize: 10,
  remainingEvolutions: 1,
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
  ...evolvesFrom(DIGLETT),
  name: 'DUGTRIO',
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 19.0,
  skillPercentage: 2.0,
  carrySize: 16,
  maxCarrySize: 21,
};

export const BELLSPROUT: Pokemon = {
  name: 'BELLSPROUT',
  specialty: 'ingredient',
  frequency: toSeconds(1, 26, 40),
  ingredientPercentage: 23.3,
  skillPercentage: 3.9,
  berry: DURIN,
  carrySize: 8,
  maxCarrySize: 8,
  remainingEvolutions: 2,
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
  ...evolvesFrom(BELLSPROUT),
  name: 'WEEPINBELL',
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 23.5,
  skillPercentage: 4.0,
  carrySize: 12,
  maxCarrySize: 17,
};

export const VICTREEBEL: Pokemon = {
  ...evolvesFrom(WEEPINBELL),
  name: 'VICTREEBEL',
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 23.3,
  skillPercentage: 3.9,
  carrySize: 17,
  maxCarrySize: 27,
};

export const GEODUDE: Pokemon = {
  name: 'GEODUDE',
  specialty: 'ingredient',
  frequency: toSeconds(1, 35, 0),
  ingredientPercentage: 28.1,
  skillPercentage: 5.2,
  berry: SITRUS,
  carrySize: 9,
  maxCarrySize: 9,
  remainingEvolutions: 2,
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
  ...evolvesFrom(GEODUDE),
  name: 'GRAVELER',
  frequency: toSeconds(1, 6, 40),
  ingredientPercentage: 27.2,
  skillPercentage: 4.8,
  carrySize: 12,
  maxCarrySize: 17,
};

export const GOLEM: Pokemon = {
  ...evolvesFrom(GRAVELER),
  name: 'GOLEM',
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 28.0,
  skillPercentage: 5.2,
  carrySize: 16,
  maxCarrySize: 26,
};

export const GASTLY: Pokemon = {
  name: 'GASTLY',
  specialty: 'ingredient',
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 14.4,
  skillPercentage: 1.5,
  berry: BLUK,
  carrySize: 10,
  maxCarrySize: 10,
  remainingEvolutions: 2,
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
  ...evolvesFrom(GASTLY),
  name: 'HAUNTER',
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 15.7,
  skillPercentage: 2.2,
  carrySize: 14,
  maxCarrySize: 19,
};

export const GENGAR: Pokemon = {
  ...evolvesFrom(HAUNTER),
  name: 'GENGAR',
  frequency: toSeconds(0, 36, 40),
  ingredientPercentage: 16.1,
  skillPercentage: 2.4,
  carrySize: 18,
  maxCarrySize: 28,
};

export const KANGASKHAN: Pokemon = {
  name: 'KANGASKHAN',
  specialty: 'ingredient',
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 22.2,
  skillPercentage: 1.7,
  berry: PERSIM,
  carrySize: 18,
  maxCarrySize: 18,
  remainingEvolutions: 0,
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
  ingredientPercentage: 21.6,
  skillPercentage: 3.9,
  berry: MAGO,
  carrySize: 17,
  maxCarrySize: 22,
  remainingEvolutions: 0,
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
  ingredientPercentage: 21.6,
  skillPercentage: 3.1,
  berry: LUM,
  carrySize: 24,
  maxCarrySize: 24,
  remainingEvolutions: 0,
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
  ingredientPercentage: 20.1,
  skillPercentage: 3.6,
  berry: PERSIM,
  carrySize: 17,
  maxCarrySize: 17,
  remainingEvolutions: 0,
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
  ingredientPercentage: 25.0,
  skillPercentage: 2.0,
  berry: YACHE,
  carrySize: 9,
  maxCarrySize: 9,
  remainingEvolutions: 2,
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
  skill: CHARGE_ENERGY_S,
};

export const DRAGONAIR: Pokemon = {
  ...evolvesFrom(DRATINI),
  name: 'DRAGONAIR',
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 26.2,
  skillPercentage: 2.5,
  carrySize: 12,
  maxCarrySize: 17,
};

export const DRAGONITE: Pokemon = {
  ...evolvesFrom(DRAGONAIR),
  name: 'DRAGONITE',
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 26.4,
  skillPercentage: 2.6,
  carrySize: 20,
  maxCarrySize: 30,
};

export const DELIBIRD: Pokemon = {
  name: 'DELIBIRD',
  specialty: 'ingredient',
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 18.8,
  skillPercentage: 1.5,
  berry: PAMTRE,
  carrySize: 20,
  maxCarrySize: 20,
  remainingEvolutions: 0,
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
  ingredientPercentage: 23.8,
  skillPercentage: 4.1,
  berry: SITRUS,
  carrySize: 9,
  maxCarrySize: 9,
  remainingEvolutions: 2,
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
  ...evolvesFrom(LARVITAR),
  name: 'PUPITAR',
  frequency: toSeconds(1, 0, 0),
  ingredientPercentage: 24.7,
  skillPercentage: 4.5,
  carrySize: 13,
  maxCarrySize: 18,
};

export const TYRANITAR: Pokemon = {
  ...evolvesFrom(PUPITAR),
  name: 'TYRANITAR',
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 26.6,
  skillPercentage: 5.2,
  berry: WIKI,
  carrySize: 19,
  maxCarrySize: 29,
};

export const ABSOL: Pokemon = {
  name: 'ABSOL',
  specialty: 'ingredient',
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 17.8,
  skillPercentage: 3.8,
  berry: WIKI,
  carrySize: 18,
  maxCarrySize: 18,
  remainingEvolutions: 0,
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
  ...evolvesInto(MR_MIME),
  name: 'MIME_JR',
  frequency: toSeconds(1, 11, 40),
  ingredientPercentage: 20.1,
  skillPercentage: 3.2,
  carrySize: 7,
  maxCarrySize: 7,
};

export const CROAGUNK: Pokemon = {
  name: 'CROAGUNK',
  specialty: 'ingredient',
  frequency: toSeconds(1, 33, 20),
  ingredientPercentage: 22.8,
  skillPercentage: 4.2,
  berry: CHESTO,
  carrySize: 10,
  maxCarrySize: 10,
  remainingEvolutions: 1,
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
  ...evolvesFrom(CROAGUNK),
  name: 'TOXICROAK',
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 22.9,
  skillPercentage: 4.3,
  carrySize: 14,
  maxCarrySize: 19,
};

export const SNOVER: Pokemon = {
  name: 'SNOVER',
  specialty: 'ingredient',
  frequency: toSeconds(1, 33, 20),
  ingredientPercentage: 25.1,
  skillPercentage: 4.4,
  berry: RAWST,
  carrySize: 10,
  maxCarrySize: 10,
  remainingEvolutions: 1,
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
  ...evolvesFrom(SNOVER),
  name: 'ABOMASNOW',
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 25.0,
  skillPercentage: 4.4,
  carrySize: 21,
  maxCarrySize: 26,
};

export const STUFFUL: Pokemon = {
  name: 'STUFFUL',
  specialty: 'ingredient',
  frequency: toSeconds(1, 8, 20),
  ingredientPercentage: 22.5,
  skillPercentage: 1.1,
  berry: CHERI,
  carrySize: 13,
  maxCarrySize: 13,
  remainingEvolutions: 1,
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
  ...evolvesFrom(STUFFUL),
  name: 'BEWEAR',
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 22.9,
  skillPercentage: 1.3,
  carrySize: 20,
  maxCarrySize: 25,
};

export const COMFEY: Pokemon = {
  name: 'COMFEY',
  specialty: 'ingredient',
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 13.9,
  skillPercentage: 2.2,
  berry: PECHA,
  carrySize: 20,
  maxCarrySize: 20,
  remainingEvolutions: 0,
  ingredient0: { amount: 2, ingredient: GREENGRASS_CORN },
  ingredient30: [
    { amount: 5, ingredient: GREENGRASS_CORN },
    { amount: 6, ingredient: WARMING_GINGER },
  ],
  ingredient60: [
    { amount: 7, ingredient: GREENGRASS_CORN },
    { amount: 9, ingredient: WARMING_GINGER },
    { amount: 7, ingredient: SOOTHING_CACAO },
  ],
  skill: ENERGIZING_CHEER_S,
};

export const CRAMORANT: Pokemon = {
  name: 'CRAMORANT',
  specialty: 'ingredient',
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 16.5,
  skillPercentage: 3.3,
  berry: PAMTRE,
  carrySize: 19,
  maxCarrySize: 19,
  remainingEvolutions: 0,
  ingredient0: { amount: 2, ingredient: PURE_OIL },
  ingredient30: [
    { amount: 5, ingredient: PURE_OIL },
    { amount: 4, ingredient: SOFT_POTATO },
  ],
  ingredient60: [
    { amount: 7, ingredient: PURE_OIL },
    { amount: 7, ingredient: SOFT_POTATO },
    { amount: 8, ingredient: FANCY_EGG },
  ],
  skill: TASTY_CHANCE_S,
};

export const SPRIGATITO: Pokemon = {
  name: 'SPRIGATITO',
  specialty: 'ingredient',
  frequency: toSeconds(1, 16, 40),
  ingredientPercentage: 20.8,
  skillPercentage: 2.3,
  berry: DURIN,
  carrySize: 10,
  maxCarrySize: 10,
  remainingEvolutions: 2,
  ingredient0: { amount: 2, ingredient: SOFT_POTATO },
  ingredient30: [
    { amount: 5, ingredient: SOFT_POTATO },
    { amount: 6, ingredient: MOOMOO_MILK },
  ],
  ingredient60: [
    { amount: 7, ingredient: SOFT_POTATO },
    { amount: 9, ingredient: MOOMOO_MILK },
    { amount: 8, ingredient: WARMING_GINGER },
  ],
  skill: COOKING_POWER_UP_S,
};

export const FLORAGATO: Pokemon = {
  ...evolvesFrom(SPRIGATITO),
  name: 'FLORAGATO',
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 20.9,
  skillPercentage: 2.3,
  carrySize: 14,
  maxCarrySize: 19,
};

export const MEOWSCARADA: Pokemon = {
  ...evolvesFrom(FLORAGATO),
  name: 'MEOWSCARADA',
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 19,
  skillPercentage: 2.2,
  berry: WIKI,
  carrySize: 18,
  maxCarrySize: 28,
};

export const FUECOCO: Pokemon = {
  name: 'FUECOCO',
  specialty: 'ingredient',
  frequency: toSeconds(1, 10, 0),
  ingredientPercentage: 25.4,
  skillPercentage: 5.3,
  berry: LEPPA,
  carrySize: 11,
  maxCarrySize: 11,
  remainingEvolutions: 2,
  ingredient0: { amount: 2, ingredient: FANCY_APPLE },
  ingredient30: [
    { amount: 5, ingredient: FANCY_APPLE },
    { amount: 4, ingredient: BEAN_SAUSAGE },
  ],
  ingredient60: [
    { amount: 7, ingredient: FANCY_APPLE },
    { amount: 6, ingredient: BEAN_SAUSAGE },
    { amount: 5, ingredient: FIERY_HERB },
  ],
  skill: CHARGE_ENERGY_S,
};

export const CROCALOR: Pokemon = {
  ...evolvesFrom(FUECOCO),
  name: 'CROCALOR',
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 24.7,
  skillPercentage: 5,
  carrySize: 16,
  maxCarrySize: 21,
};

export const SKELEDIRGE: Pokemon = {
  ...evolvesFrom(CROCALOR),
  name: 'SKELEDIRGE',
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 26.8,
  skillPercentage: 6.2,
  berry: BLUK,
  carrySize: 19,
  maxCarrySize: 29,
};

export const QUAXLY: Pokemon = {
  name: 'QUAXLY',
  specialty: 'ingredient',
  frequency: toSeconds(1, 20, 0),
  ingredientPercentage: 26.1,
  skillPercentage: 2.8,
  berry: ORAN,
  carrySize: 10,
  maxCarrySize: 10,
  remainingEvolutions: 2,
  ingredient0: { amount: 2, ingredient: GREENGRASS_SOYBEANS },
  ingredient30: [
    { amount: 5, ingredient: GREENGRASS_SOYBEANS },
    { amount: 2, ingredient: LARGE_LEEK },
  ],
  ingredient60: [
    { amount: 7, ingredient: GREENGRASS_SOYBEANS },
    { amount: 4, ingredient: LARGE_LEEK },
    { amount: 6, ingredient: PURE_OIL },
  ],
  skill: CHARGE_STRENGTH_M,
};

export const QUAXWELL: Pokemon = {
  ...evolvesFrom(QUAXLY),
  name: 'QUAXWELL',
  frequency: toSeconds(1, 0, 0),
  ingredientPercentage: 25.9,
  skillPercentage: 2.7,
  carrySize: 14,
  maxCarrySize: 19,
};

export const QUAQUAVAL: Pokemon = {
  ...evolvesFrom(QUAXWELL),
  name: 'QUAQUAVAL',
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 23.2,
  skillPercentage: 2.4,
  berry: CHERI,
  carrySize: 19,
  maxCarrySize: 29,
};

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
  COMFEY,
  CRAMORANT,
  MEOWSCARADA,
  SKELEDIRGE,
  QUAQUAVAL,
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
  SPRIGATITO,
  FLORAGATO,
  FUECOCO,
  CROCALOR,
  QUAXLY,
  QUAXWELL,
];

export const ALL_INGREDIENT_SPECIALISTS: Pokemon[] = [
  ...OPTIMAL_INGREDIENT_SPECIALISTS,
  ...INFERIOR_INGREDIENT_SPECIALISTS,
];
