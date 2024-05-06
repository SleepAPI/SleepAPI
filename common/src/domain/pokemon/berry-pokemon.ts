import { toSeconds } from 'src/utils/time-utils/frequency-utils';
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
  PURE_OIL,
  SNOOZY_TOMATO,
  SOFT_POTATO,
  SOOTHING_CACAO,
  TASTY_MUSHROOM,
  WARMING_GINGER,
} from '../ingredient/ingredient';
import {
  CHARGE_ENERGY_S,
  CHARGE_STRENGTH_S,
  CHARGE_STRENGTH_S_RANGE,
  ENERGIZING_CHEER_S,
  INGREDIENT_MAGNET_S,
  METRONOME,
} from '../mainskill/mainskill';
import { Pokemon } from './pokemon';

export const CATERPIE: Pokemon = {
  name: 'CATERPIE',
  specialty: 'berry',
  frequency: toSeconds(1, 13, 20),
  ingredientPercentage: 17.9,
  skillPercentage: 0.8,
  berry: LUM,
  carrySize: 11,
  maxCarrySize: 11,
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

export const METAPOD: Pokemon = {
  ...CATERPIE,
  name: 'METAPOD',
  frequency: toSeconds(1, 10, 0),
  ingredientPercentage: 20.8,
  skillPercentage: 1.8,
  carrySize: 13,
  maxCarrySize: 18,
};

export const BUTTERFREE: Pokemon = {
  ...CATERPIE,
  name: 'BUTTERFREE',
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 19.7,
  skillPercentage: 1.4,
  carrySize: 21,
  maxCarrySize: 31,
};

export const RATTATA: Pokemon = {
  name: 'RATTATA',
  specialty: 'berry',
  frequency: toSeconds(1, 21, 40),
  ingredientPercentage: 23.7,
  skillPercentage: 3.0,
  berry: PERSIM,
  carrySize: 10,
  maxCarrySize: 10,
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

export const RATICATE: Pokemon = {
  ...RATTATA,
  name: 'RATICATE',
  frequency: toSeconds(0, 53, 20),
  ingredientPercentage: 23.7,
  skillPercentage: 3.0,
  carrySize: 16,
  maxCarrySize: 21,
};

export const EKANS: Pokemon = {
  name: 'EKANS',
  specialty: 'berry',
  frequency: toSeconds(1, 23, 20),
  ingredientPercentage: 23.5,
  skillPercentage: 3.3,
  berry: CHESTO,
  carrySize: 10,
  maxCarrySize: 10,
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

export const ARBOK: Pokemon = {
  ...EKANS,
  name: 'ARBOK',
  frequency: toSeconds(1, 1, 40),
  ingredientPercentage: 26.4,
  skillPercentage: 5.7,
  carrySize: 14,
  maxCarrySize: 19,
};

export const PIKACHU: Pokemon = {
  name: 'PIKACHU',
  specialty: 'berry',
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 20.7,
  skillPercentage: 2.1,
  berry: GREPA,
  carrySize: 17,
  maxCarrySize: 22,
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
  skill: CHARGE_STRENGTH_S,
};

export const PIKACHU_HALLOWEEN: Pokemon = {
  name: 'PIKACHU_HALLOWEEN',
  specialty: 'berry',
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 21.8,
  skillPercentage: 2.1,
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
  ...PIKACHU,
  name: 'RAICHU',
  frequency: toSeconds(0, 36, 40),
  ingredientPercentage: 22.4,
  skillPercentage: 3.2,
  carrySize: 21,
  maxCarrySize: 31,
};

export const CLEFAIRY: Pokemon = {
  name: 'CLEFAIRY',
  specialty: 'berry',
  frequency: toSeconds(1, 6, 40),
  ingredientPercentage: 16.8,
  skillPercentage: 3.6,
  berry: PECHA,
  carrySize: 16,
  maxCarrySize: 21,
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

export const CLEFABLE: Pokemon = {
  ...CLEFAIRY,
  name: 'CLEFABLE',
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 16.8,
  skillPercentage: 3.6,
  carrySize: 24,
  maxCarrySize: 34,
};

export const VULPIX: Pokemon = {
  name: 'VULPIX',
  specialty: 'berry',
  frequency: toSeconds(1, 18, 20),
  ingredientPercentage: 16.8,
  skillPercentage: 2.7,
  berry: LEPPA,
  carrySize: 13,
  maxCarrySize: 13,
  ingredient0: { amount: 1, ingredient: GREENGRASS_SOYBEANS },
  ingredient30: [
    { amount: 2, ingredient: GREENGRASS_SOYBEANS },
    { amount: 2, ingredient: GREENGRASS_CORN },
  ],
  ingredient60: [
    { amount: 4, ingredient: GREENGRASS_SOYBEANS },
    { amount: 3, ingredient: GREENGRASS_CORN },
    { amount: 3, ingredient: SOFT_POTATO },
  ],
  skill: ENERGIZING_CHEER_S,
};

export const NINETALES: Pokemon = {
  ...VULPIX,
  name: 'NINETALES',
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 16.4,
  skillPercentage: 2.5,
  carrySize: 23,
  maxCarrySize: 28,
};

export const MANKEY: Pokemon = {
  name: 'MANKEY',
  specialty: 'berry',
  frequency: toSeconds(1, 10, 0),
  ingredientPercentage: 19.7,
  skillPercentage: 2.2,
  berry: CHERI,
  carrySize: 7,
  maxCarrySize: 7,
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

export const PRIMEAPE: Pokemon = {
  ...MANKEY,
  name: 'PRIMEAPE',
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 20.0,
  skillPercentage: 2.4,
  carrySize: 17,
  maxCarrySize: 22,
};

export const DODUO: Pokemon = {
  name: 'DODUO',
  specialty: 'berry',
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 18.4,
  skillPercentage: 2.0,
  berry: PAMTRE,
  carrySize: 13,
  maxCarrySize: 13,
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

export const DODRIO: Pokemon = {
  ...DODUO,
  name: 'DODRIO',
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 18.4,
  skillPercentage: 2.0,
  carrySize: 21,
  maxCarrySize: 26,
};

export const ONIX: Pokemon = {
  name: 'ONIX',
  specialty: 'berry',
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 13.2,
  skillPercentage: 2.3,
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

export const CUBONE: Pokemon = {
  name: 'CUBONE',
  specialty: 'berry',
  frequency: toSeconds(1, 20, 0),
  ingredientPercentage: 22.3,
  skillPercentage: 4.4,
  berry: FIGY,
  carrySize: 10,
  maxCarrySize: 10,
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

export const MAROWAK: Pokemon = {
  ...CUBONE,
  name: 'MAROWAK',
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 22.5,
  skillPercentage: 4.5,
  carrySize: 15,
  maxCarrySize: 20,
};

export const CHIKORITA: Pokemon = {
  name: 'CHIKORITA',
  specialty: 'berry',
  frequency: toSeconds(1, 13, 20),
  ingredientPercentage: 16.9,
  skillPercentage: 3.9,
  berry: DURIN,
  carrySize: 12,
  maxCarrySize: 12,
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

export const BAYLEEF: Pokemon = {
  ...CHIKORITA,
  name: 'BAYLEEF',
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 16.8,
  skillPercentage: 3.8,
  carrySize: 17,
  maxCarrySize: 22,
};

export const MEGANIUM: Pokemon = {
  ...CHIKORITA,
  name: 'MEGANIUM',
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 17.5,
  skillPercentage: 4.6,
  carrySize: 20,
  maxCarrySize: 30,
};

export const CYNDAQUIL: Pokemon = {
  name: 'CYNDAQUIL',
  specialty: 'berry',
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 18.6,
  skillPercentage: 2.1,
  berry: LEPPA,
  carrySize: 14,
  maxCarrySize: 14,
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

export const QUILAVA: Pokemon = {
  ...CYNDAQUIL,
  name: 'QUILAVA',
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 21.1,
  skillPercentage: 4.1,
  carrySize: 18,
  maxCarrySize: 23,
};

export const TYPHLOSION: Pokemon = {
  ...CYNDAQUIL,
  name: 'TYPHLOSION',
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 20.8,
  skillPercentage: 3.9,
  carrySize: 23,
  maxCarrySize: 33,
};

export const TOTODILE: Pokemon = {
  name: 'TOTODILE',
  specialty: 'berry',
  frequency: toSeconds(1, 15, 0),
  ingredientPercentage: 25.3,
  skillPercentage: 5.2,
  berry: ORAN,
  carrySize: 11,
  maxCarrySize: 11,
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

export const CROCONAW: Pokemon = {
  ...TOTODILE,
  name: 'CROCONAW',
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 25.3,
  skillPercentage: 5.2,
  carrySize: 15,
  maxCarrySize: 20,
};

export const FERALIGATR: Pokemon = {
  ...TOTODILE,
  name: 'FERALIGATR',
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 25.7,
  skillPercentage: 5.5,
  carrySize: 19,
  maxCarrySize: 29,
};

export const PICHU: Pokemon = {
  ...PIKACHU,
  name: 'PICHU',
  frequency: toSeconds(1, 11, 40),
  ingredientPercentage: 21.0,
  skillPercentage: 2.3,
  carrySize: 10,
  maxCarrySize: 10,
};

export const CLEFFA: Pokemon = {
  ...CLEFAIRY,
  name: 'CLEFFA',
  frequency: toSeconds(1, 33, 20),
  ingredientPercentage: 16.4,
  skillPercentage: 3.4,
  carrySize: 10,
  maxCarrySize: 10,
};

export const STEELIX: Pokemon = {
  ...ONIX,
  name: 'STEELIX',
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 15.4,
  skillPercentage: 3.2,
  berry: BELUE,
  carrySize: 25,
  maxCarrySize: 30,
};

export const HOUNDOUR: Pokemon = {
  name: 'HOUNDOUR',
  specialty: 'berry',
  frequency: toSeconds(1, 21, 40),
  ingredientPercentage: 20.1,
  skillPercentage: 4.4,
  berry: WIKI,
  carrySize: 10,
  maxCarrySize: 10,
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

export const HOUNDOOM: Pokemon = {
  ...HOUNDOUR,
  name: 'HOUNDOOM',
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 20.3,
  skillPercentage: 4.6,
  carrySize: 16,
  maxCarrySize: 21,
};

export const SLAKOTH: Pokemon = {
  name: 'SLAKOTH',
  specialty: 'berry',
  frequency: toSeconds(1, 21, 40),
  ingredientPercentage: 21.6,
  skillPercentage: 1.9,
  berry: PERSIM,
  carrySize: 7,
  maxCarrySize: 7,
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

export const VIGOROTH: Pokemon = {
  ...SLAKOTH,
  name: 'VIGOROTH',
  frequency: toSeconds(0, 53, 20),
  ingredientPercentage: 20.4,
  skillPercentage: 1.5,
  carrySize: 9,
  maxCarrySize: 14,
};

export const SLAKING: Pokemon = {
  ...SLAKOTH,
  name: 'SLAKING',
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 33.9,
  skillPercentage: 6.7,
  carrySize: 12,
  maxCarrySize: 22,
};

export const SWABLU: Pokemon = {
  name: 'SWABLU',
  specialty: 'berry',
  frequency: toSeconds(1, 10, 0),
  ingredientPercentage: 17.7,
  skillPercentage: 3.2,
  berry: PAMTRE,
  carrySize: 12,
  maxCarrySize: 12,
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

export const ALTARIA: Pokemon = {
  ...SWABLU,
  name: 'ALTARIA',
  frequency: toSeconds(1, 1, 40),
  ingredientPercentage: 25.8,
  skillPercentage: 6.1,
  berry: YACHE,
  carrySize: 14,
  maxCarrySize: 19,
};

export const SHUPPET: Pokemon = {
  name: 'SHUPPET',
  specialty: 'berry',
  frequency: toSeconds(1, 5, 0),
  ingredientPercentage: 17.1,
  skillPercentage: 2.6,
  berry: BLUK,
  carrySize: 11,
  maxCarrySize: 11,
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

export const BANETTE: Pokemon = {
  ...SHUPPET,
  name: 'BANETTE',
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 17.9,
  skillPercentage: 3.3,
  carrySize: 19,
  maxCarrySize: 24,
};

export const SPHEAL: Pokemon = {
  name: 'SPHEAL',
  specialty: 'berry',
  frequency: toSeconds(1, 33, 20),
  ingredientPercentage: 22.4,
  skillPercentage: 2.3,
  berry: RAWST,
  carrySize: 9,
  maxCarrySize: 9,
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

export const SEALEO: Pokemon = {
  ...SPHEAL,
  name: 'SEALEO',
  frequency: toSeconds(1, 6, 40),
  ingredientPercentage: 22.1,
  skillPercentage: 2.1,
  carrySize: 13,
  maxCarrySize: 18,
};

export const WALREIN: Pokemon = {
  ...SPHEAL,
  name: 'WALREIN',
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 22.3,
  skillPercentage: 2.2,
  carrySize: 18,
  maxCarrySize: 28,
};

export const OPTIMAL_BERRY_SPECIALISTS: Pokemon[] = [
  BUTTERFREE,
  RATICATE,
  ARBOK,
  PIKACHU_HALLOWEEN,
  RAICHU,
  CLEFABLE,
  NINETALES,
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

export const INFERIOR_BERRY_SPECIALISTS: Pokemon[] = [
  CATERPIE,
  METAPOD,
  RATTATA,
  EKANS,
  PIKACHU,
  CLEFAIRY,
  VULPIX,
  MANKEY,
  DODUO,
  CUBONE,
  CHIKORITA,
  BAYLEEF,
  CYNDAQUIL,
  QUILAVA,
  TOTODILE,
  CROCONAW,
  PICHU,
  CLEFFA,
  HOUNDOUR,
  SLAKOTH,
  SWABLU,
  SHUPPET,
  SPHEAL,
  SEALEO,
];

export const ALL_BERRY_SPECIALISTS: Pokemon[] = [...OPTIMAL_BERRY_SPECIALISTS, ...INFERIOR_BERRY_SPECIALISTS];
