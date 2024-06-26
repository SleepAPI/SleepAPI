import { toSeconds } from '../../utils/time-utils/frequency-utils';
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
  CHARGE_STRENGTH_S_RANGE,
  COOKING_POWER_UP_S,
  DREAM_SHARD_MAGNET_S,
  DREAM_SHARD_MAGNET_S_RANGE,
  ENERGIZING_CHEER_S,
  ENERGY_FOR_EVERYONE,
  EXTRA_HELPFUL_S,
  HELPER_BOOST,
  INGREDIENT_MAGNET_S,
  METRONOME,
  TASTY_CHANCE_S,
} from '../mainskill/mainskill';
import { Pokemon } from './pokemon';

export const PIKACHU_CHRISTMAS: Pokemon = {
  name: 'PIKACHU_CHRISTMAS',
  specialty: 'skill',
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 13.1,
  skillPercentage: 4.2,
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

export const JIGGLYPUFF: Pokemon = {
  name: 'JIGGLYPUFF',
  specialty: 'skill',
  frequency: toSeconds(1, 5, 0),
  ingredientPercentage: 18.2,
  skillPercentage: 4.3,
  berry: PECHA,
  carrySize: 9,
  maxCarrySize: 14,
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

export const WIGGLYTUFF: Pokemon = {
  ...JIGGLYPUFF,
  name: 'WIGGLYTUFF',
  frequency: toSeconds(0, 48, 20),
  ingredientPercentage: 17.4,
  skillPercentage: 4.0,
  carrySize: 13,
  maxCarrySize: 23,
};

export const MEOWTH: Pokemon = {
  name: 'MEOWTH',
  specialty: 'skill',
  frequency: toSeconds(1, 13, 20),
  ingredientPercentage: 16.3,
  skillPercentage: 4.2,
  berry: PERSIM,
  carrySize: 9,
  maxCarrySize: 9,
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

export const PERSIAN: Pokemon = {
  ...MEOWTH,
  name: 'PERSIAN',
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 16.9,
  skillPercentage: 4.4,
  carrySize: 12,
  maxCarrySize: 17,
};

export const PSYDUCK: Pokemon = {
  name: 'PSYDUCK',
  specialty: 'skill',
  frequency: toSeconds(1, 30, 0),
  ingredientPercentage: 13.6,
  skillPercentage: 12.6,
  berry: ORAN,
  carrySize: 8,
  maxCarrySize: 8,
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

export const GOLDUCK: Pokemon = {
  ...PSYDUCK,
  name: 'GOLDUCK',
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 16.2,
  skillPercentage: 12.5,
  carrySize: 14,
  maxCarrySize: 19,
};

export const GROWLITHE: Pokemon = {
  name: 'GROWLITHE',
  specialty: 'skill',
  frequency: toSeconds(1, 11, 40),
  ingredientPercentage: 13.8,
  skillPercentage: 5.0,
  berry: LEPPA,
  carrySize: 8,
  maxCarrySize: 8,
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

export const ARCANINE: Pokemon = {
  ...GROWLITHE,
  name: 'ARCANINE',
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 13.6,
  skillPercentage: 4.9,
  carrySize: 16,
  maxCarrySize: 21,
};

export const SLOWPOKE: Pokemon = {
  name: 'SLOWPOKE',
  specialty: 'skill',
  frequency: toSeconds(1, 35, 0),
  ingredientPercentage: 15.1,
  skillPercentage: 6.7,
  berry: ORAN,
  carrySize: 9,
  maxCarrySize: 9,
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

export const SLOWBRO: Pokemon = {
  ...SLOWPOKE,
  name: 'SLOWBRO',
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 19.7,
  skillPercentage: 6.8,
  carrySize: 16,
  maxCarrySize: 21,
};

export const MAGNEMITE: Pokemon = {
  name: 'MAGNEMITE',
  specialty: 'skill',
  frequency: toSeconds(1, 36, 40),
  ingredientPercentage: 18.2,
  skillPercentage: 6.4,
  berry: BELUE,
  carrySize: 8,
  maxCarrySize: 8,
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

export const MAGNETON: Pokemon = {
  ...MAGNEMITE,
  name: 'MAGNETON',
  frequency: toSeconds(1, 6, 40),
  ingredientPercentage: 18.2,
  skillPercentage: 6.3,
  carrySize: 11,
  maxCarrySize: 16,
};

export const EEVEE: Pokemon = {
  name: 'EEVEE',
  specialty: 'skill',
  frequency: toSeconds(1, 1, 40),
  ingredientPercentage: 19.2,
  skillPercentage: 5.5,
  berry: PERSIM,
  carrySize: 12,
  maxCarrySize: 12,
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

export const VAPOREON: Pokemon = {
  ...EEVEE,
  name: 'VAPOREON',
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 21.2,
  skillPercentage: 6.1,
  berry: ORAN,
  carrySize: 13,
  maxCarrySize: 18,
  skill: INGREDIENT_MAGNET_S,
};

export const JOLTEON: Pokemon = {
  ...EEVEE,
  name: 'JOLTEON',
  frequency: toSeconds(0, 36, 40),
  ingredientPercentage: 15.1,
  skillPercentage: 3.9,
  berry: GREPA,
  carrySize: 17,
  maxCarrySize: 22,
  skill: EXTRA_HELPFUL_S,
};

export const FLAREON: Pokemon = {
  ...EEVEE,
  name: 'FLAREON',
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 18.5,
  skillPercentage: 5.2,
  berry: LEPPA,
  carrySize: 14,
  maxCarrySize: 19,
  skill: COOKING_POWER_UP_S,
};

export const IGGLYBUFF: Pokemon = {
  ...JIGGLYPUFF,
  name: 'IGGLYBUFF',
  frequency: toSeconds(1, 26, 40),
  ingredientPercentage: 17.0,
  skillPercentage: 3.8,
  carrySize: 8,
  maxCarrySize: 8,
};

export const TOGEPI: Pokemon = {
  name: 'TOGEPI',
  specialty: 'skill',
  frequency: toSeconds(1, 20, 0),
  ingredientPercentage: 15.1,
  skillPercentage: 4.9,
  berry: PECHA,
  carrySize: 8,
  maxCarrySize: 8,
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

export const TOGETIC: Pokemon = {
  ...TOGEPI,
  name: 'TOGETIC',
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 16.3,
  skillPercentage: 5.6,
  carrySize: 10,
  maxCarrySize: 15,
};

export const MAREEP: Pokemon = {
  name: 'MAREEP',
  specialty: 'skill',
  frequency: toSeconds(1, 16, 40),
  ingredientPercentage: 12.8,
  skillPercentage: 4.7,
  berry: GREPA,
  carrySize: 9,
  maxCarrySize: 9,
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

export const FLAAFFY: Pokemon = {
  ...MAREEP,
  name: 'FLAAFFY',
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 12.7,
  skillPercentage: 4.6,
  carrySize: 11,
  maxCarrySize: 16,
};

export const AMPHAROS: Pokemon = {
  ...MAREEP,
  name: 'AMPHAROS',
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 13.0,
  skillPercentage: 4.7,
  carrySize: 15,
  maxCarrySize: 25,
};

export const SUDOWOODO: Pokemon = {
  name: 'SUDOWOODO',
  specialty: 'skill',
  frequency: toSeconds(1, 6, 40),
  ingredientPercentage: 21.7,
  skillPercentage: 7.2,
  berry: SITRUS,
  carrySize: 16,
  maxCarrySize: 21,
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
  ...EEVEE,
  name: 'ESPEON',
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 16.4,
  skillPercentage: 4.4,
  berry: MAGO,
  carrySize: 16,
  maxCarrySize: 21,
  skill: CHARGE_STRENGTH_M,
};

export const UMBREON: Pokemon = {
  ...EEVEE,
  name: 'UMBREON',
  frequency: toSeconds(0, 53, 20),
  ingredientPercentage: 21.9,
  skillPercentage: 14.1,
  berry: WIKI,
  carrySize: 14,
  maxCarrySize: 19,
  skill: CHARGE_ENERGY_S,
};

export const SLOWKING: Pokemon = {
  ...SLOWPOKE,
  name: 'SLOWKING',
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 16.6,
  skillPercentage: 7.4,
  carrySize: 17,
  maxCarrySize: 22,
};

export const WOBBUFFET: Pokemon = {
  name: 'WOBBUFFET',
  specialty: 'skill',
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 21.1,
  skillPercentage: 6.4,
  berry: MAGO,
  carrySize: 13,
  maxCarrySize: 18,
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
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 15.8,
  skillPercentage: 4.7,
  berry: LUM,
  carrySize: 20,
  maxCarrySize: 20,
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

export const RAIKOU: Pokemon = {
  name: 'RAIKOU',
  specialty: 'skill',
  frequency: toSeconds(0, 35, 0),
  ingredientPercentage: 19.2,
  skillPercentage: 1.9,
  berry: GREPA,
  carrySize: 22,
  maxCarrySize: 22,
  ingredient0: { amount: 1, ingredient: BEAN_SAUSAGE },
  ingredient30: [
    { amount: 2, ingredient: BEAN_SAUSAGE },
    { amount: 2, ingredient: FIERY_HERB },
  ],
  ingredient60: [
    { amount: 4, ingredient: BEAN_SAUSAGE },
    { amount: 3, ingredient: FIERY_HERB },
    { amount: 2, ingredient: LARGE_LEEK },
  ],
  skill: HELPER_BOOST,
};

export const ENTEI: Pokemon = {
  name: 'ENTEI',
  specialty: 'skill',
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 18.7,
  skillPercentage: 2.3,
  berry: LEPPA,
  carrySize: 19,
  maxCarrySize: 19,
  ingredient0: { amount: 1, ingredient: PURE_OIL },
  ingredient30: [
    { amount: 2, ingredient: PURE_OIL },
    { amount: 2, ingredient: SNOOZY_TOMATO },
  ],
  ingredient60: [
    { amount: 4, ingredient: PURE_OIL },
    { amount: 4, ingredient: SNOOZY_TOMATO },
    { amount: 3, ingredient: TASTY_MUSHROOM },
  ],
  skill: HELPER_BOOST,
};

export const RALTS: Pokemon = {
  name: 'RALTS',
  specialty: 'skill',
  frequency: toSeconds(1, 20, 0),
  ingredientPercentage: 14.5,
  skillPercentage: 4.3,
  berry: MAGO,
  carrySize: 9,
  maxCarrySize: 9,
  ingredient0: { amount: 1, ingredient: FANCY_APPLE },
  ingredient30: [
    { amount: 2, ingredient: FANCY_APPLE },
    { amount: 1, ingredient: GREENGRASS_CORN },
  ],
  ingredient60: [
    { amount: 4, ingredient: FANCY_APPLE },
    { amount: 2, ingredient: GREENGRASS_CORN },
    { amount: 2, ingredient: LARGE_LEEK },
  ],
  skill: ENERGY_FOR_EVERYONE,
};

export const KIRLIA: Pokemon = {
  ...RALTS,
  name: 'KIRLIA',
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 14.6,
  skillPercentage: 4.3,
  carrySize: 13,
  maxCarrySize: 18,
};

export const GARDEVOIR: Pokemon = {
  ...RALTS,
  name: 'GARDEVOIR',
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 14.4,
  skillPercentage: 4.2,
  carrySize: 18,
  maxCarrySize: 28,
};

export const SABLEYE: Pokemon = {
  name: 'SABLEYE',
  specialty: 'skill',
  frequency: toSeconds(1, 0, 0),
  ingredientPercentage: 18.8,
  skillPercentage: 6.8,
  berry: WIKI,
  carrySize: 16,
  maxCarrySize: 16,
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

export const GULPIN: Pokemon = {
  name: 'GULPIN',
  specialty: 'skill',
  frequency: toSeconds(1, 38, 20),
  ingredientPercentage: 21.4,
  skillPercentage: 6.3,
  berry: CHESTO,
  carrySize: 8,
  maxCarrySize: 8,
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

export const SWALOT: Pokemon = {
  ...GULPIN,
  name: 'SWALOT',
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 21,
  skillPercentage: 7,
  carrySize: 19,
  maxCarrySize: 24,
};

export const WYNAUT: Pokemon = {
  ...WOBBUFFET,
  name: 'WYNAUT',
  frequency: toSeconds(1, 36, 40),
  ingredientPercentage: 21.3,
  skillPercentage: 5.9,
  carrySize: 7,
  maxCarrySize: 7,
};

export const BONSLY: Pokemon = {
  ...SUDOWOODO,
  name: 'BONSLY',
  frequency: toSeconds(1, 45, 0),
  ingredientPercentage: 18.9,
  skillPercentage: 6.1,
  carrySize: 8,
  maxCarrySize: 8,
};

export const RIOLU: Pokemon = {
  name: 'RIOLU',
  specialty: 'skill',
  frequency: toSeconds(1, 10, 0),
  ingredientPercentage: 12.6,
  skillPercentage: 3.8,
  berry: CHERI,
  carrySize: 9,
  maxCarrySize: 9,
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

export const LUCARIO: Pokemon = {
  ...RIOLU,
  name: 'LUCARIO',
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 15.0,
  skillPercentage: 5.1,
  carrySize: 14,
  maxCarrySize: 19,
};

export const MAGNEZONE: Pokemon = {
  ...MAGNEMITE,
  name: 'MAGNEZONE',
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 17.9,
  skillPercentage: 6.2,
  carrySize: 13,
  maxCarrySize: 23,
};

export const TOGEKISS: Pokemon = {
  ...TOGEPI,
  name: 'TOGEKISS',
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 15.8,
  skillPercentage: 5.3,
  carrySize: 16,
  maxCarrySize: 26,
};

export const LEAFEON: Pokemon = {
  ...EEVEE,
  name: 'LEAFEON',
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 20.5,
  skillPercentage: 5.9,
  berry: DURIN,
  carrySize: 13,
  maxCarrySize: 18,
  skill: ENERGIZING_CHEER_S,
};

export const GLACEON: Pokemon = {
  ...EEVEE,
  name: 'GLACEON',
  frequency: toSeconds(0, 53, 20),
  ingredientPercentage: 21.9,
  skillPercentage: 6.3,
  berry: RAWST,
  carrySize: 12,
  maxCarrySize: 17,
  skill: COOKING_POWER_UP_S,
};

export const GALLADE: Pokemon = {
  ...RALTS,
  name: 'GALLADE',
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 14.7,
  skillPercentage: 5.4,
  carrySize: 19,
  maxCarrySize: 29,
  berry: CHERI,
  skill: EXTRA_HELPFUL_S,
};

export const SYLVEON: Pokemon = {
  ...EEVEE,
  name: 'SYLVEON',
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 17.8,
  skillPercentage: 4.0,
  berry: PECHA,
  carrySize: 15,
  maxCarrySize: 20,
  skill: ENERGY_FOR_EVERYONE,
};

export const DEDENNE: Pokemon = {
  name: 'DEDENNE',
  specialty: 'skill',
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 17.7,
  skillPercentage: 4.5,
  berry: GREPA,
  carrySize: 19,
  maxCarrySize: 19,
  ingredient0: { amount: 1, ingredient: FANCY_APPLE },
  ingredient30: [
    { amount: 2, ingredient: FANCY_APPLE },
    { amount: 1, ingredient: SOOTHING_CACAO },
  ],
  ingredient60: [
    { amount: 4, ingredient: FANCY_APPLE },
    { amount: 2, ingredient: SOOTHING_CACAO },
    { amount: 2, ingredient: GREENGRASS_CORN },
  ],
  skill: TASTY_CHANCE_S,
};

export const OPTIMAL_SKILL_SPECIALISTS: Pokemon[] = [
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
  RAIKOU,
  ENTEI,
  GARDEVOIR,
  SABLEYE,
  SWALOT,
  LUCARIO,
  MAGNEZONE,
  TOGEKISS,
  LEAFEON,
  GLACEON,
  GALLADE,
  SYLVEON,
  DEDENNE,
];

export const INFERIOR_SKILL_SPECIALISTS: Pokemon[] = [
  JIGGLYPUFF,
  MEOWTH,
  PSYDUCK,
  GROWLITHE,
  SLOWPOKE,
  MAGNEMITE,
  MAGNETON,
  EEVEE,
  IGGLYBUFF,
  TOGEPI,
  TOGETIC,
  MAREEP,
  FLAAFFY,
  RALTS,
  KIRLIA,
  GULPIN,
  WYNAUT,
  BONSLY,
  RIOLU,
];

export const ALL_SKILL_SPECIALISTS: Pokemon[] = [...OPTIMAL_SKILL_SPECIALISTS, ...INFERIOR_SKILL_SPECIALISTS];
