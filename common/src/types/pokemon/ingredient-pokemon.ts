import {
  createIngredientSpecialist,
  evolvedPokemon,
  preEvolvedPokemon
} from '../../utils/pokemon-utils/pokemon-constructors';
import { toSeconds } from '../../utils/time-utils/frequency-utils';
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
  MAGO,
  ORAN,
  PAMTRE,
  PECHA,
  PERSIM,
  RAWST,
  SITRUS,
  WIKI,
  YACHE
} from '../berry/berries';
import { BALANCED_GENDER, FEMALE_ONLY, GENDER_UNKNOWN, SEVEN_EIGHTHS_MALE, THREE_FOURTHS_FEMALE } from '../gender';
import {
  BEAN_SAUSAGE,
  FANCY_APPLE,
  FANCY_EGG,
  FIERY_HERB,
  GLOSSY_AVOCADO,
  GREENGRASS_CORN,
  GREENGRASS_SOYBEANS,
  HONEY,
  LARGE_LEEK,
  MOOMOO_MILK,
  PLUMP_PUMPKIN,
  PURE_OIL,
  ROUSING_COFFEE,
  SLOWPOKE_TAIL,
  SNOOZY_TOMATO,
  SOFT_POTATO,
  SOOTHING_CACAO,
  TASTY_MUSHROOM,
  WARMING_GINGER
} from '../ingredient/ingredients';
import {
  ChargeEnergyS,
  ChargeStrengthM,
  ChargeStrengthS,
  ChargeStrengthSRange,
  CookingPowerUpS,
  EnergizingCheerS,
  EnergyForEveryoneS,
  ExtraHelpfulS,
  IngredientDrawSCutiefly,
  IngredientDrawSHyperCutter,
  IngredientMagnetS,
  IngredientMagnetSPresent,
  SkillCopyMimic,
  SkillCopyTransform,
  TastyChanceS
} from '../mainskill/mainskills';

import type { Pokemon } from './pokemon';

export const BULBASAUR: Pokemon = createIngredientSpecialist({
  name: 'BULBASAUR',
  pokedexNumber: 1,
  frequency: toSeconds(1, 13, 20),
  ingredientPercentage: 25.7,
  skillPercentage: 1.9,
  berry: DURIN,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 11,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: HONEY,
    b: SNOOZY_TOMATO,
    c: SOFT_POTATO
  },
  skill: IngredientMagnetS
});

export const IVYSAUR: Pokemon = evolvedPokemon(BULBASAUR, {
  name: 'IVYSAUR',
  pokedexNumber: 2,
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 25.5,
  skillPercentage: 1.9,
  carrySize: 14
});

export const VENUSAUR: Pokemon = evolvedPokemon(IVYSAUR, {
  name: 'VENUSAUR',
  pokedexNumber: 3,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 26.6,
  skillPercentage: 2.1,
  carrySize: 17
});

export const CHARMANDER: Pokemon = createIngredientSpecialist({
  name: 'CHARMANDER',
  pokedexNumber: 4,
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 20.1,
  skillPercentage: 1.1,
  berry: LEPPA,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 12,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: BEAN_SAUSAGE,
    b: WARMING_GINGER,
    c: FIERY_HERB
  },
  skill: IngredientMagnetS
});

export const CHARMELEON: Pokemon = evolvedPokemon(CHARMANDER, {
  name: 'CHARMELEON',
  pokedexNumber: 5,
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 22.7,
  skillPercentage: 1.6,
  carrySize: 15
});

export const CHARIZARD: Pokemon = evolvedPokemon(CHARMELEON, {
  name: 'CHARIZARD',
  pokedexNumber: 6,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 22.4,
  skillPercentage: 1.6,
  carrySize: 19
});

export const SQUIRTLE: Pokemon = createIngredientSpecialist({
  name: 'SQUIRTLE',
  pokedexNumber: 7,
  frequency: toSeconds(1, 15, 0),
  ingredientPercentage: 27.1,
  skillPercentage: 2.0,
  berry: ORAN,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: MOOMOO_MILK,
    b: SOOTHING_CACAO,
    c: BEAN_SAUSAGE
  },
  skill: IngredientMagnetS
});

export const WARTORTLE: Pokemon = evolvedPokemon(SQUIRTLE, {
  name: 'WARTORTLE',
  pokedexNumber: 8,
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 27.1,
  skillPercentage: 2.0,
  carrySize: 14
});

export const BLASTOISE: Pokemon = evolvedPokemon(WARTORTLE, {
  name: 'BLASTOISE',
  pokedexNumber: 9,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 27.5,
  skillPercentage: 2.1,
  carrySize: 17
});

export const DIGLETT: Pokemon = createIngredientSpecialist({
  name: 'DIGLETT',
  pokedexNumber: 50,
  frequency: toSeconds(1, 11, 40),
  ingredientPercentage: 19.2,
  skillPercentage: 2.1,
  berry: FIGY,
  genders: BALANCED_GENDER,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: SNOOZY_TOMATO,
    b: LARGE_LEEK,
    c: GREENGRASS_SOYBEANS
  },
  skill: ChargeStrengthS
});

export const DUGTRIO: Pokemon = evolvedPokemon(DIGLETT, {
  name: 'DUGTRIO',
  pokedexNumber: 51,
  frequency: toSeconds(0, 44, 10),
  ingredientPercentage: 19.0,
  skillPercentage: 2.0,
  carrySize: 16
});

export const BELLSPROUT: Pokemon = createIngredientSpecialist({
  name: 'BELLSPROUT',
  pokedexNumber: 69,
  frequency: toSeconds(1, 26, 40),
  ingredientPercentage: 23.3,
  skillPercentage: 3.9,
  berry: DURIN,
  genders: BALANCED_GENDER,
  carrySize: 8,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: SNOOZY_TOMATO,
    b: SOFT_POTATO,
    c: LARGE_LEEK
  },
  skill: ChargeEnergyS
});

export const WEEPINBELL: Pokemon = evolvedPokemon(BELLSPROUT, {
  name: 'WEEPINBELL',
  pokedexNumber: 70,
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 23.5,
  skillPercentage: 4.0,
  carrySize: 12
});

export const VICTREEBEL: Pokemon = evolvedPokemon(WEEPINBELL, {
  name: 'VICTREEBEL',
  pokedexNumber: 71,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 23.3,
  skillPercentage: 3.9,
  carrySize: 17
});

export const GEODUDE: Pokemon = createIngredientSpecialist({
  name: 'GEODUDE',
  pokedexNumber: 74,
  frequency: toSeconds(1, 35, 0),
  ingredientPercentage: 28.1,
  skillPercentage: 5.2,
  berry: SITRUS,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: GREENGRASS_SOYBEANS,
    b: SOFT_POTATO,
    c: TASTY_MUSHROOM
  },
  skill: ChargeStrengthSRange
});

export const GRAVELER: Pokemon = evolvedPokemon(GEODUDE, {
  name: 'GRAVELER',
  pokedexNumber: 75,
  frequency: toSeconds(1, 6, 40),
  ingredientPercentage: 27.2,
  skillPercentage: 4.8,
  carrySize: 12
});

export const GOLEM: Pokemon = evolvedPokemon(GRAVELER, {
  name: 'GOLEM',
  pokedexNumber: 76,
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 28.0,
  skillPercentage: 5.2,
  carrySize: 16
});

export const FARFETCHD: Pokemon = createIngredientSpecialist({
  name: 'FARFETCHD',
  pokedexNumber: 83,
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 16,
  skillPercentage: 4.3,
  berry: PAMTRE,
  genders: BALANCED_GENDER,
  carrySize: 18,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: LARGE_LEEK,
    b: BEAN_SAUSAGE,
    c: WARMING_GINGER
  },
  skill: ChargeStrengthS
});

export const GASTLY: Pokemon = createIngredientSpecialist({
  name: 'GASTLY',
  pokedexNumber: 92,
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 14.4,
  skillPercentage: 1.5,
  berry: BLUK,
  genders: BALANCED_GENDER,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: FIERY_HERB,
    b: TASTY_MUSHROOM,
    c: PURE_OIL
  },
  skill: ChargeStrengthSRange
});

export const HAUNTER: Pokemon = evolvedPokemon(GASTLY, {
  name: 'HAUNTER',
  pokedexNumber: 93,
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 15.7,
  skillPercentage: 2.2,
  carrySize: 14
});

export const GENGAR: Pokemon = evolvedPokemon(HAUNTER, {
  name: 'GENGAR',
  pokedexNumber: 94,
  frequency: toSeconds(0, 36, 40),
  ingredientPercentage: 16.1,
  skillPercentage: 2.4,
  carrySize: 18
});

export const KANGASKHAN: Pokemon = createIngredientSpecialist({
  name: 'KANGASKHAN',
  pokedexNumber: 115,
  frequency: toSeconds(0, 44, 10),
  ingredientPercentage: 22.2,
  skillPercentage: 3.2,
  berry: PERSIM,
  genders: FEMALE_ONLY,
  carrySize: 21,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: WARMING_GINGER,
    b: SOFT_POTATO,
    c: GREENGRASS_SOYBEANS
  },
  skill: IngredientMagnetS
});

export const CHANSEY: Pokemon = createIngredientSpecialist({
  name: 'CHANSEY',
  pokedexNumber: 113,
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 23.6,
  skillPercentage: 2.3,
  berry: PERSIM,
  genders: FEMALE_ONLY,
  carrySize: 15,
  previousEvolutions: 1,
  remainingEvolutions: 1,
  ingredients: {
    a: FANCY_EGG,
    b: SOFT_POTATO,
    c: HONEY
  },
  skill: EnergyForEveryoneS
});

export const MR_MIME: Pokemon = createIngredientSpecialist({
  name: 'MR_MIME',
  pokedexNumber: 122,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 21.6,
  skillPercentage: 3.9,
  berry: MAGO,
  genders: BALANCED_GENDER,
  carrySize: 17,
  previousEvolutions: 1,
  remainingEvolutions: 0,
  ingredients: {
    a: SNOOZY_TOMATO,
    b: SOFT_POTATO,
    c: LARGE_LEEK
  },
  skill: SkillCopyMimic
});

export const PINSIR: Pokemon = createIngredientSpecialist({
  name: 'PINSIR',
  pokedexNumber: 127,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 21.6,
  skillPercentage: 3.1,
  berry: LUM,
  genders: BALANCED_GENDER,
  carrySize: 24,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: HONEY,
    b: FANCY_APPLE,
    c: BEAN_SAUSAGE
  },
  skill: ChargeStrengthM
});

export const DITTO: Pokemon = createIngredientSpecialist({
  name: 'DITTO',
  pokedexNumber: 132,
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 20.1,
  skillPercentage: 3.6,
  berry: PERSIM,
  genders: GENDER_UNKNOWN,
  carrySize: 17,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: PURE_OIL,
    b: LARGE_LEEK,
    c: SLOWPOKE_TAIL
  },
  skill: SkillCopyTransform
});

export const DRATINI: Pokemon = createIngredientSpecialist({
  name: 'DRATINI',
  pokedexNumber: 147,
  frequency: toSeconds(1, 23, 20),
  ingredientPercentage: 25.0,
  skillPercentage: 2.0,
  berry: YACHE,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: FIERY_HERB,
    b: GREENGRASS_CORN,
    c: PURE_OIL
  },
  skill: ChargeEnergyS
});

export const DRAGONAIR: Pokemon = evolvedPokemon(DRATINI, {
  name: 'DRAGONAIR',
  pokedexNumber: 148,
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 26.2,
  skillPercentage: 2.5,
  carrySize: 12
});

export const DRAGONITE: Pokemon = evolvedPokemon(DRAGONAIR, {
  name: 'DRAGONITE',
  pokedexNumber: 149,
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 26.4,
  skillPercentage: 2.6,
  carrySize: 20
});

export const WOOPER: Pokemon = createIngredientSpecialist({
  name: 'WOOPER',
  pokedexNumber: 194,
  frequency: toSeconds(1, 38, 20),
  ingredientPercentage: 20.1,
  skillPercentage: 3.8,
  berry: ORAN,
  genders: BALANCED_GENDER,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: TASTY_MUSHROOM,
    b: SOFT_POTATO,
    c: BEAN_SAUSAGE
  },
  skill: ChargeEnergyS
});

export const WOOPER_PALDEAN: Pokemon = createIngredientSpecialist({
  name: 'WOOPER_PALDEAN',
  pokedexNumber: 194,
  frequency: toSeconds(1, 46, 40),
  ingredientPercentage: 20.9,
  skillPercentage: 5.6,
  berry: CHESTO,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: SOOTHING_CACAO,
    b: ROUSING_COFFEE,
    c: SOFT_POTATO
  },
  skill: ChargeEnergyS
});

export const QUAGSIRE: Pokemon = evolvedPokemon(WOOPER, {
  name: 'QUAGSIRE',
  pokedexNumber: 195,
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 19,
  skillPercentage: 3.2,
  carrySize: 16
});

export const DELIBIRD: Pokemon = createIngredientSpecialist({
  name: 'DELIBIRD',
  pokedexNumber: 225,
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 18.8,
  skillPercentage: 3,
  berry: PAMTRE,
  genders: BALANCED_GENDER,
  carrySize: 20,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: FANCY_EGG,
    b: FANCY_APPLE,
    c: SOOTHING_CACAO
  },
  skill: IngredientMagnetSPresent
});

export const BLISSEY: Pokemon = evolvedPokemon(CHANSEY, {
  name: 'BLISSEY',
  pokedexNumber: 242,
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 23.8,
  skillPercentage: 2.3,
  carrySize: 21
});

export const LARVITAR: Pokemon = createIngredientSpecialist({
  name: 'LARVITAR',
  pokedexNumber: 246,
  frequency: toSeconds(1, 20, 0),
  ingredientPercentage: 23.8,
  skillPercentage: 4.1,
  berry: SITRUS,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: WARMING_GINGER,
    b: GREENGRASS_SOYBEANS,
    c: BEAN_SAUSAGE
  },
  skill: ChargeEnergyS
});

export const PUPITAR: Pokemon = evolvedPokemon(LARVITAR, {
  name: 'PUPITAR',
  pokedexNumber: 247,
  frequency: toSeconds(1, 0, 0),
  ingredientPercentage: 24.7,
  skillPercentage: 4.5,
  carrySize: 13
});

export const TYRANITAR: Pokemon = evolvedPokemon(PUPITAR, {
  name: 'TYRANITAR',
  pokedexNumber: 248,
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 26.6,
  skillPercentage: 5.2,
  berry: WIKI,
  carrySize: 19
});

export const MAWILE: Pokemon = createIngredientSpecialist({
  name: 'MAWILE',
  pokedexNumber: 303,
  frequency: toSeconds(0, 53, 20),
  ingredientPercentage: 20.4,
  skillPercentage: 3.8,
  berry: BELUE,
  genders: BALANCED_GENDER,
  carrySize: 17,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: PURE_OIL,
    b: GREENGRASS_CORN,
    c: SNOOZY_TOMATO
  },
  skill: IngredientDrawSHyperCutter
});

export const ARON: Pokemon = createIngredientSpecialist({
  name: 'ARON',
  pokedexNumber: 304,
  frequency: toSeconds(1, 35, 0),
  ingredientPercentage: 27.3,
  skillPercentage: 4.6,
  berry: BELUE,
  genders: BALANCED_GENDER,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: BEAN_SAUSAGE,
    b: ROUSING_COFFEE,
    c: GREENGRASS_SOYBEANS
  },
  skill: ChargeEnergyS
});

export const LAIRON: Pokemon = evolvedPokemon(ARON, {
  name: 'LAIRON',
  pokedexNumber: 305,
  frequency: toSeconds(1, 10, 0),
  ingredientPercentage: 27.7,
  skillPercentage: 4.8,
  carrySize: 13
});

export const AGGRON: Pokemon = evolvedPokemon(LAIRON, {
  name: 'AGGRON',
  pokedexNumber: 306,
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 28.5,
  skillPercentage: 5.2,
  carrySize: 18
});

export const TRAPINCH: Pokemon = createIngredientSpecialist({
  name: 'TRAPINCH',
  pokedexNumber: 328,
  frequency: toSeconds(1, 23, 20),
  ingredientPercentage: 15.2,
  skillPercentage: 3.1,
  berry: FIGY,
  genders: BALANCED_GENDER,
  carrySize: 8,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: GLOSSY_AVOCADO,
    b: FIERY_HERB,
    c: GREENGRASS_SOYBEANS
  },
  skill: ChargeStrengthS
});

export const VIBRAVA: Pokemon = evolvedPokemon(TRAPINCH, {
  name: 'VIBRAVA',
  pokedexNumber: 329,
  frequency: toSeconds(1, 1, 40),
  ingredientPercentage: 15.5,
  skillPercentage: 3.4,
  carrySize: 12
});

export const FLYGON: Pokemon = evolvedPokemon(VIBRAVA, {
  name: 'FLYGON',
  pokedexNumber: 330,
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 17.2,
  skillPercentage: 3.9,
  carrySize: 17
});

export const ABSOL: Pokemon = createIngredientSpecialist({
  name: 'ABSOL',
  pokedexNumber: 359,
  frequency: toSeconds(0, 49, 10),
  ingredientPercentage: 17.8,
  skillPercentage: 3.8,
  berry: WIKI,
  genders: BALANCED_GENDER,
  carrySize: 21,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: SOOTHING_CACAO,
    b: FANCY_APPLE,
    c: TASTY_MUSHROOM
  },
  skill: ChargeStrengthM
});

export const SHINX: Pokemon = createIngredientSpecialist({
  name: 'SHINX',
  pokedexNumber: 403,
  frequency: toSeconds(1, 13, 20),
  ingredientPercentage: 18.1,
  skillPercentage: 1.8,
  berry: GREPA,
  genders: BALANCED_GENDER,
  carrySize: 11,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: SNOOZY_TOMATO,
    b: PURE_OIL,
    c: ROUSING_COFFEE
  },
  skill: CookingPowerUpS
});

export const LUXIO: Pokemon = evolvedPokemon(SHINX, {
  name: 'LUXIO',
  pokedexNumber: 404,
  frequency: toSeconds(0, 53, 20),
  ingredientPercentage: 18.2,
  skillPercentage: 1.8,
  carrySize: 16
});

export const LUXRAY: Pokemon = evolvedPokemon(LUXIO, {
  name: 'LUXRAY',
  pokedexNumber: 405,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 20,
  skillPercentage: 2.3,
  carrySize: 21
});

export const MIME_JR: Pokemon = preEvolvedPokemon(MR_MIME, {
  name: 'MIME_JR',
  pokedexNumber: 439,
  frequency: toSeconds(1, 11, 40),
  ingredientPercentage: 20.1,
  skillPercentage: 3.2,
  carrySize: 10
});

export const HAPPINY: Pokemon = preEvolvedPokemon(CHANSEY, {
  name: 'HAPPINY',
  pokedexNumber: 440,
  frequency: toSeconds(1, 30, 0),
  ingredientPercentage: 21,
  skillPercentage: 1.3,
  carrySize: 7
});

export const SPIRITOMB: Pokemon = createIngredientSpecialist({
  name: 'SPIRITOMB',
  pokedexNumber: 442,
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 19.8,
  skillPercentage: 3.6,
  berry: WIKI,
  genders: BALANCED_GENDER,
  carrySize: 27,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: { a: TASTY_MUSHROOM, b: PLUMP_PUMPKIN, c: LARGE_LEEK },
  skill: ExtraHelpfulS
});

export const CROAGUNK: Pokemon = createIngredientSpecialist({
  name: 'CROAGUNK',
  pokedexNumber: 453,
  frequency: toSeconds(1, 33, 20),
  ingredientPercentage: 22.8,
  skillPercentage: 4.2,
  berry: CHESTO,
  genders: BALANCED_GENDER,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: PURE_OIL,
    b: BEAN_SAUSAGE
  },
  skill: ChargeStrengthS
});

export const TOXICROAK: Pokemon = evolvedPokemon(CROAGUNK, {
  name: 'TOXICROAK',
  pokedexNumber: 454,
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 22.9,
  skillPercentage: 4.3,
  carrySize: 14
});

export const SNOVER: Pokemon = createIngredientSpecialist({
  name: 'SNOVER',
  pokedexNumber: 459,
  frequency: toSeconds(1, 33, 20),
  ingredientPercentage: 25.1,
  skillPercentage: 4.4,
  berry: RAWST,
  genders: BALANCED_GENDER,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: SNOOZY_TOMATO,
    b: FANCY_EGG,
    c: TASTY_MUSHROOM
  },
  skill: ChargeStrengthSRange
});

export const ABOMASNOW: Pokemon = evolvedPokemon(SNOVER, {
  name: 'ABOMASNOW',
  pokedexNumber: 460,
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 25.0,
  skillPercentage: 4.4,
  carrySize: 21
});

const pumpkabooSharedStats = {
  pokedexNumber: 710,
  ingredientPercentage: 12.0,
  skillPercentage: 4.9,
  berry: BLUK,
  genders: BALANCED_GENDER,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: PLUMP_PUMPKIN,
    b: GREENGRASS_SOYBEANS,
    c: SOFT_POTATO
  },
  skill: ChargeStrengthS
};

export const PUMPKABOO_SMALL: Pokemon = createIngredientSpecialist({
  ...pumpkabooSharedStats,
  name: 'PUMPKABOO_SMALL',
  frequency: toSeconds(1, 28, 20),
  carrySize: 7
});

export const PUMPKABOO_MEDIUM: Pokemon = createIngredientSpecialist({
  ...pumpkabooSharedStats,
  name: 'PUMPKABOO_MEDIUM',
  frequency: toSeconds(1, 30, 0),
  carrySize: 11
});

export const PUMPKABOO_LARGE: Pokemon = createIngredientSpecialist({
  ...pumpkabooSharedStats,
  name: 'PUMPKABOO_LARGE',
  frequency: toSeconds(1, 31, 40),
  carrySize: 15
});

export const PUMPKABOO_JUMBO: Pokemon = createIngredientSpecialist({
  ...pumpkabooSharedStats,
  name: 'PUMPKABOO_JUMBO',
  frequency: toSeconds(1, 33, 20),
  carrySize: 21
});

const gourgeistSharedStats = {
  pokedexNumber: 711,
  ingredientPercentage: 13.0,
  skillPercentage: 4.9
};

export const GOURGEIST_SMALL: Pokemon = evolvedPokemon(PUMPKABOO_SMALL, {
  ...gourgeistSharedStats,
  name: 'GOURGEIST_SMALL',
  frequency: toSeconds(0, 51, 40),
  carrySize: 10
});

export const GOURGEIST_MEDIUM: Pokemon = evolvedPokemon(PUMPKABOO_MEDIUM, {
  ...gourgeistSharedStats,
  name: 'GOURGEIST_MEDIUM',
  frequency: toSeconds(0, 53, 20),
  carrySize: 14
});

export const GOURGEIST_LARGE: Pokemon = evolvedPokemon(PUMPKABOO_LARGE, {
  ...gourgeistSharedStats,
  name: 'GOURGEIST_LARGE',
  frequency: toSeconds(0, 55, 0),
  carrySize: 19
});

export const GOURGEIST_JUMBO: Pokemon = evolvedPokemon(PUMPKABOO_JUMBO, {
  ...gourgeistSharedStats,
  name: 'GOURGEIST_JUMBO',
  frequency: toSeconds(0, 56, 40),
  carrySize: 25
});

export const GRUBBIN: Pokemon = createIngredientSpecialist({
  name: 'GRUBBIN',
  pokedexNumber: 736,
  frequency: toSeconds(1, 16, 40),
  ingredientPercentage: 15.5,
  skillPercentage: 2.9,
  berry: LUM,
  genders: BALANCED_GENDER,
  carrySize: 11,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: ROUSING_COFFEE,
    b: TASTY_MUSHROOM,
    c: HONEY
  },
  skill: ChargeStrengthS
});

export const CHARJABUG: Pokemon = evolvedPokemon(GRUBBIN, {
  name: 'CHARJABUG',
  pokedexNumber: 737,
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 15.4,
  skillPercentage: 2.8,
  carrySize: 15
});

export const VIKAVOLT: Pokemon = evolvedPokemon(CHARJABUG, {
  name: 'VIKAVOLT',
  pokedexNumber: 738,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 19.4,
  skillPercentage: 5.1,
  carrySize: 19
});

export const CUTIEFLY: Pokemon = createIngredientSpecialist({
  name: 'CUTIEFLY',
  pokedexNumber: 742,
  frequency: toSeconds(1, 15, 0),
  ingredientPercentage: 19.9,
  skillPercentage: 1.9,
  berry: PECHA,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: HONEY,
    b: PURE_OIL,
    c: GREENGRASS_CORN
  },
  skill: IngredientDrawSCutiefly
});

export const RIBOMBEE: Pokemon = evolvedPokemon(CUTIEFLY, {
  name: 'RIBOMBEE',
  pokedexNumber: 743,
  frequency: toSeconds(0, 38, 20),
  ingredientPercentage: 19.4,
  skillPercentage: 2.5,
  carrySize: 19
});

export const STUFFUL: Pokemon = createIngredientSpecialist({
  name: 'STUFFUL',
  pokedexNumber: 759,
  frequency: toSeconds(1, 8, 20),
  ingredientPercentage: 22.5,
  skillPercentage: 1.1,
  berry: CHERI,
  genders: BALANCED_GENDER,
  carrySize: 13,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: GREENGRASS_CORN,
    b: BEAN_SAUSAGE,
    c: FANCY_EGG
  },
  skill: ChargeStrengthSRange
});

export const BEWEAR: Pokemon = evolvedPokemon(STUFFUL, {
  name: 'BEWEAR',
  pokedexNumber: 760,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 22.9,
  skillPercentage: 1.3,
  carrySize: 20
});

export const COMFEY: Pokemon = createIngredientSpecialist({
  name: 'COMFEY',
  pokedexNumber: 764,
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 16.7,
  skillPercentage: 3.5,
  berry: PECHA,
  genders: THREE_FOURTHS_FEMALE,
  carrySize: 20,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: GREENGRASS_CORN,
    b: WARMING_GINGER,
    c: SOOTHING_CACAO
  },
  skill: EnergizingCheerS
});

export const CRAMORANT: Pokemon = createIngredientSpecialist({
  name: 'CRAMORANT',
  pokedexNumber: 845,
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 16.5,
  skillPercentage: 3.9,
  berry: PAMTRE,
  genders: BALANCED_GENDER,
  carrySize: 19,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: PURE_OIL,
    b: SOFT_POTATO,
    c: FANCY_EGG
  },
  skill: TastyChanceS
});

export const DRAMPA: Pokemon = createIngredientSpecialist({
  name: 'DRAMPA',
  pokedexNumber: 780,
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 29.4,
  skillPercentage: 4.6,
  berry: YACHE,
  genders: BALANCED_GENDER,
  carrySize: 25,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: GREENGRASS_SOYBEANS,
    b: GLOSSY_AVOCADO,
    c: BEAN_SAUSAGE
  },
  skill: TastyChanceS
});

export const SPRIGATITO: Pokemon = createIngredientSpecialist({
  name: 'SPRIGATITO',
  pokedexNumber: 906,
  frequency: toSeconds(1, 16, 40),
  ingredientPercentage: 20.8,
  skillPercentage: 2.3,
  berry: DURIN,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: SOFT_POTATO,
    b: MOOMOO_MILK,
    c: WARMING_GINGER
  },
  skill: CookingPowerUpS
});

export const FLORAGATO: Pokemon = evolvedPokemon(SPRIGATITO, {
  name: 'FLORAGATO',
  pokedexNumber: 907,
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 20.9,
  skillPercentage: 2.3,
  carrySize: 14
});

export const MEOWSCARADA: Pokemon = evolvedPokemon(FLORAGATO, {
  name: 'MEOWSCARADA',
  pokedexNumber: 908,
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 19,
  skillPercentage: 2.2,
  berry: WIKI,
  carrySize: 18
});

export const FUECOCO: Pokemon = createIngredientSpecialist({
  name: 'FUECOCO',
  pokedexNumber: 909,
  frequency: toSeconds(1, 10, 0),
  ingredientPercentage: 25.4,
  skillPercentage: 5.3,
  berry: LEPPA,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 11,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: FANCY_APPLE,
    b: BEAN_SAUSAGE,
    c: FIERY_HERB
  },
  skill: ChargeEnergyS
});

export const CROCALOR: Pokemon = evolvedPokemon(FUECOCO, {
  name: 'CROCALOR',
  pokedexNumber: 910,
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 24.7,
  skillPercentage: 5,
  carrySize: 16
});

export const SKELEDIRGE: Pokemon = evolvedPokemon(CROCALOR, {
  name: 'SKELEDIRGE',
  pokedexNumber: 911,
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 26.8,
  skillPercentage: 6.2,
  berry: BLUK,
  carrySize: 19
});

export const QUAXLY: Pokemon = createIngredientSpecialist({
  name: 'QUAXLY',
  pokedexNumber: 912,
  frequency: toSeconds(1, 20, 0),
  ingredientPercentage: 26.1,
  skillPercentage: 2.8,
  berry: ORAN,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: GREENGRASS_SOYBEANS,
    b: LARGE_LEEK,
    c: PURE_OIL
  },
  skill: ChargeStrengthM
});

export const QUAXWELL: Pokemon = evolvedPokemon(QUAXLY, {
  name: 'QUAXWELL',
  pokedexNumber: 913,
  frequency: toSeconds(1, 0, 0),
  ingredientPercentage: 25.9,
  skillPercentage: 2.7,
  carrySize: 14
});

export const QUAQUAVAL: Pokemon = evolvedPokemon(QUAXWELL, {
  name: 'QUAQUAVAL',
  pokedexNumber: 914,
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 23.2,
  skillPercentage: 2.4,
  berry: CHERI,
  carrySize: 19
});

export const CETODDLE: Pokemon = createIngredientSpecialist({
  name: 'CETODDLE',
  pokedexNumber: 974,
  frequency: toSeconds(1, 25, 0),
  ingredientPercentage: 22.3,
  skillPercentage: 4.2,
  berry: RAWST,
  genders: BALANCED_GENDER,
  carrySize: 12,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: SOFT_POTATO,
    b: BEAN_SAUSAGE,
    c: PLUMP_PUMPKIN
  },
  skill: ChargeEnergyS
});

export const CETITAN: Pokemon = evolvedPokemon(CETODDLE, {
  name: 'CETITAN',
  pokedexNumber: 975,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 20.9,
  skillPercentage: 4.2,
  carrySize: 25
});

export const CLODSIRE: Pokemon = evolvedPokemon(WOOPER_PALDEAN, {
  name: 'CLODSIRE',
  pokedexNumber: 980,
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 20.8,
  skillPercentage: 5.5,
  carrySize: 20
});
