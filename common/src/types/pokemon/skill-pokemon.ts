import {
  createSkillSpecialist,
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
import {
  BALANCED_GENDER,
  FEMALE_ONLY,
  GENDER_UNKNOWN,
  MALE_ONLY,
  SEVEN_EIGHTHS_MALE,
  THREE_FOURTHS_FEMALE,
  THREE_FOURTHS_MALE
} from '../gender';
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
  BerryBurst,
  BerryBurstDisguise,
  BerryBurstDracoMeteor,
  ChargeEnergySMoonlight,
  ChargeStrengthM,
  ChargeStrengthSRange,
  ChargeStrengthSStockpile,
  CookingAssistSBulkUp,
  CookingPowerUpS,
  CookingPowerUpSMinus,
  DreamShardMagnetS,
  DreamShardMagnetSAuraSphere,
  DreamShardMagnetSRange,
  EnergizingCheerS,
  EnergizingCheerSHealPulse,
  EnergizingCheerSNuzzle,
  EnergyForEveryoneS,
  EnergyForEveryoneSBerryJuice,
  EnergyForEveryoneSLunarBlessing,
  ExtraHelpfulS,
  HelperBoost,
  IngredientDrawSDwebble,
  IngredientDrawSHawlucha,
  IngredientDrawSSandshrew,
  IngredientDrawSSuperLuck,
  IngredientMagnetS,
  IngredientMagnetSPlusPlusle,
  IngredientMagnetSPlusToxtricity,
  Metronome,
  TastyChanceS
} from '../mainskill/mainskills';

import type { Pokemon } from './pokemon';

export const PIKACHU_HOLIDAY: Pokemon = createSkillSpecialist({
  name: 'PIKACHU_HOLIDAY',
  pokedexNumber: 25,
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 13.1,
  skillPercentage: 4.2,
  berry: GREPA,
  genders: BALANCED_GENDER, // unverified for Sleep
  carrySize: 16,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: FANCY_APPLE,
    b: WARMING_GINGER,
    c: FANCY_EGG
  },
  skill: DreamShardMagnetS
});

export const SANDSHREW: Pokemon = createSkillSpecialist({
  name: 'SANDSHREW',
  pokedexNumber: 27,
  frequency: toSeconds(1, 28, 20),
  ingredientPercentage: 10,
  skillPercentage: 4.6,
  berry: FIGY,
  genders: BALANCED_GENDER,
  carrySize: 11,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: PLUMP_PUMPKIN,
    b: GREENGRASS_CORN,
    c: SOFT_POTATO
  },
  skill: IngredientDrawSSandshrew
});

export const SANDSLASH: Pokemon = evolvedPokemon(SANDSHREW, {
  name: 'SANDSLASH',
  pokedexNumber: 28,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 10.8,
  skillPercentage: 4.3,
  carrySize: 17
});

export const JIGGLYPUFF: Pokemon = createSkillSpecialist({
  name: 'JIGGLYPUFF',
  pokedexNumber: 39,
  frequency: toSeconds(1, 5, 0),
  ingredientPercentage: 18.2,
  skillPercentage: 4.3,
  berry: PECHA,
  genders: THREE_FOURTHS_FEMALE,
  carrySize: 9,
  previousEvolutions: 1,
  remainingEvolutions: 1,
  ingredients: {
    a: HONEY,
    b: PURE_OIL,
    c: SOOTHING_CACAO
  },
  skill: EnergyForEveryoneS
});

export const WIGGLYTUFF: Pokemon = evolvedPokemon(JIGGLYPUFF, {
  name: 'WIGGLYTUFF',
  pokedexNumber: 40,
  frequency: toSeconds(0, 45, 50),
  ingredientPercentage: 19.1,
  skillPercentage: 4.0,
  carrySize: 22
});

export const MEOWTH: Pokemon = createSkillSpecialist({
  name: 'MEOWTH',
  pokedexNumber: 52,
  frequency: toSeconds(1, 13, 20),
  ingredientPercentage: 16.3,
  skillPercentage: 4.2,
  berry: PERSIM,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: MOOMOO_MILK,
    b: BEAN_SAUSAGE
  },
  skill: DreamShardMagnetS
});

export const PERSIAN: Pokemon = evolvedPokemon(MEOWTH, {
  name: 'PERSIAN',
  pokedexNumber: 53,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 16.9,
  skillPercentage: 4.4,
  carrySize: 12
});

export const PSYDUCK: Pokemon = createSkillSpecialist({
  name: 'PSYDUCK',
  pokedexNumber: 54,
  frequency: toSeconds(1, 30, 0),
  ingredientPercentage: 13.6,
  skillPercentage: 12.6,
  berry: ORAN,
  genders: BALANCED_GENDER,
  carrySize: 8,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: SOOTHING_CACAO,
    b: FANCY_APPLE,
    c: BEAN_SAUSAGE
  },
  skill: ChargeStrengthSRange
});

export const GOLDUCK: Pokemon = evolvedPokemon(PSYDUCK, {
  name: 'GOLDUCK',
  pokedexNumber: 55,
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 16.2,
  skillPercentage: 12.5,
  carrySize: 14
});

export const GROWLITHE: Pokemon = createSkillSpecialist({
  name: 'GROWLITHE',
  pokedexNumber: 58,
  frequency: toSeconds(1, 11, 40),
  ingredientPercentage: 13.8,
  skillPercentage: 5.0,
  berry: LEPPA,
  genders: THREE_FOURTHS_MALE,
  carrySize: 8,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: FIERY_HERB,
    b: BEAN_SAUSAGE,
    c: MOOMOO_MILK
  },
  skill: ExtraHelpfulS
});

export const ARCANINE: Pokemon = evolvedPokemon(GROWLITHE, {
  name: 'ARCANINE',
  pokedexNumber: 59,
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 13.6,
  skillPercentage: 4.9,
  carrySize: 16
});

export const SLOWPOKE: Pokemon = createSkillSpecialist({
  name: 'SLOWPOKE',
  pokedexNumber: 79,
  frequency: toSeconds(1, 35, 0),
  ingredientPercentage: 15.1,
  skillPercentage: 7.8,
  berry: ORAN,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: SOOTHING_CACAO,
    b: SLOWPOKE_TAIL,
    c: SNOOZY_TOMATO
  },
  skill: EnergizingCheerS
});

export const SLOWBRO: Pokemon = evolvedPokemon(SLOWPOKE, {
  name: 'SLOWBRO',
  pokedexNumber: 80,
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 19.7,
  skillPercentage: 8,
  carrySize: 16
});

export const MAGNEMITE: Pokemon = createSkillSpecialist({
  name: 'MAGNEMITE',
  pokedexNumber: 81,
  frequency: toSeconds(1, 36, 40),
  ingredientPercentage: 18.2,
  skillPercentage: 6.4,
  berry: BELUE,
  genders: GENDER_UNKNOWN,
  carrySize: 8,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: PURE_OIL,
    b: FIERY_HERB
  },
  skill: CookingPowerUpS
});

export const MAGNETON: Pokemon = evolvedPokemon(MAGNEMITE, {
  name: 'MAGNETON',
  pokedexNumber: 82,
  frequency: toSeconds(1, 6, 40),
  ingredientPercentage: 18.2,
  skillPercentage: 6.3,
  carrySize: 11
});

export const EEVEE: Pokemon = createSkillSpecialist({
  name: 'EEVEE',
  pokedexNumber: 133,
  frequency: toSeconds(1, 1, 40),
  ingredientPercentage: 19.2,
  skillPercentage: 5.5,
  berry: PERSIM,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 12,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: MOOMOO_MILK,
    b: SOOTHING_CACAO,
    c: BEAN_SAUSAGE
  },
  skill: IngredientMagnetS
});

export const EEVEE_HALLOWEEN: Pokemon = createSkillSpecialist({
  name: 'EEVEE_HALLOWEEN',
  pokedexNumber: 133,
  frequency: toSeconds(0, 53, 20),
  ingredientPercentage: 12.0,
  skillPercentage: 4.6,
  berry: PERSIM,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 18,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: PLUMP_PUMPKIN,
    b: SOOTHING_CACAO,
    c: MOOMOO_MILK
  },
  skill: IngredientMagnetS
});

export const VAPOREON: Pokemon = evolvedPokemon(EEVEE, {
  name: 'VAPOREON',
  pokedexNumber: 134,
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 21.2,
  skillPercentage: 6.1,
  berry: ORAN,
  carrySize: 13,
  skill: IngredientMagnetS
});

export const JOLTEON: Pokemon = evolvedPokemon(EEVEE, {
  name: 'JOLTEON',
  pokedexNumber: 135,
  frequency: toSeconds(0, 36, 40),
  ingredientPercentage: 15.1,
  skillPercentage: 3.9,
  berry: GREPA,
  carrySize: 17,
  skill: ExtraHelpfulS
});

export const FLAREON: Pokemon = evolvedPokemon(EEVEE, {
  name: 'FLAREON',
  pokedexNumber: 136,
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 18.5,
  skillPercentage: 5.2,
  berry: LEPPA,
  carrySize: 14,
  skill: CookingPowerUpS
});

export const IGGLYBUFF: Pokemon = preEvolvedPokemon(JIGGLYPUFF, {
  name: 'IGGLYBUFF',
  pokedexNumber: 174,
  frequency: toSeconds(1, 26, 40),
  ingredientPercentage: 17.0,
  skillPercentage: 3.8,
  carrySize: 8
});

export const TOGEPI: Pokemon = createSkillSpecialist({
  name: 'TOGEPI',
  pokedexNumber: 175,
  frequency: toSeconds(1, 20, 0),
  ingredientPercentage: 15.1,
  skillPercentage: 4.9,
  berry: PECHA,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 8,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: FANCY_EGG,
    b: WARMING_GINGER,
    c: SOOTHING_CACAO
  },
  skill: Metronome
});

export const TOGETIC: Pokemon = evolvedPokemon(TOGEPI, {
  name: 'TOGETIC',
  pokedexNumber: 176,
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 16.3,
  skillPercentage: 5.6,
  carrySize: 10
});

export const MAREEP: Pokemon = createSkillSpecialist({
  name: 'MAREEP',
  pokedexNumber: 179,
  frequency: toSeconds(1, 16, 40),
  ingredientPercentage: 12.8,
  skillPercentage: 4.7,
  berry: GREPA,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: FIERY_HERB,
    b: FANCY_EGG
  },
  skill: ChargeStrengthM
});

export const FLAAFFY: Pokemon = evolvedPokemon(MAREEP, {
  name: 'FLAAFFY',
  pokedexNumber: 180,
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 12.7,
  skillPercentage: 4.6,
  carrySize: 11
});

export const AMPHAROS: Pokemon = evolvedPokemon(FLAAFFY, {
  name: 'AMPHAROS',
  pokedexNumber: 181,
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 13.0,
  skillPercentage: 4.7,
  carrySize: 15
});

export const SUDOWOODO: Pokemon = createSkillSpecialist({
  name: 'SUDOWOODO',
  pokedexNumber: 185,
  frequency: toSeconds(1, 6, 40),
  ingredientPercentage: 21.7,
  skillPercentage: 7.2,
  berry: SITRUS,
  genders: BALANCED_GENDER,
  carrySize: 16,
  previousEvolutions: 1,
  remainingEvolutions: 0,
  ingredients: {
    a: SNOOZY_TOMATO,
    b: GREENGRASS_SOYBEANS,
    c: TASTY_MUSHROOM
  },
  skill: ChargeStrengthM
});

export const ESPEON: Pokemon = evolvedPokemon(EEVEE, {
  name: 'ESPEON',
  pokedexNumber: 196,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 16.4,
  skillPercentage: 4.4,
  berry: MAGO,
  carrySize: 16,
  skill: ChargeStrengthM
});

export const UMBREON: Pokemon = evolvedPokemon(EEVEE, {
  name: 'UMBREON',
  pokedexNumber: 197,
  frequency: toSeconds(0, 53, 20),
  ingredientPercentage: 21.9,
  skillPercentage: 10.1,
  berry: WIKI,
  carrySize: 14,
  skill: ChargeEnergySMoonlight
});

export const MURKROW: Pokemon = createSkillSpecialist({
  name: 'MURKROW',
  pokedexNumber: 198,
  frequency: toSeconds(1, 0, 0),
  ingredientPercentage: 14.1,
  skillPercentage: 6.2,
  berry: WIKI,
  genders: BALANCED_GENDER,
  carrySize: 13,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: ROUSING_COFFEE,
    b: GREENGRASS_SOYBEANS,
    c: FIERY_HERB
  },
  skill: IngredientDrawSSuperLuck
});

export const SLOWKING: Pokemon = evolvedPokemon(SLOWPOKE, {
  name: 'SLOWKING',
  pokedexNumber: 199,
  frequency: toSeconds(0, 56, 40),
  ingredientPercentage: 16.6,
  skillPercentage: 8.7,
  carrySize: 17
});

export const WOBBUFFET: Pokemon = createSkillSpecialist({
  name: 'WOBBUFFET',
  pokedexNumber: 202,
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 21.1,
  skillPercentage: 8.2,
  berry: MAGO,
  genders: BALANCED_GENDER,
  carrySize: 16,
  previousEvolutions: 1,
  remainingEvolutions: 0,
  ingredients: {
    a: FANCY_APPLE,
    b: TASTY_MUSHROOM,
    c: PURE_OIL
  },
  skill: EnergizingCheerS
});

export const SHUCKLE: Pokemon = createSkillSpecialist({
  name: 'SHUCKLE',
  pokedexNumber: 213,
  frequency: toSeconds(1, 0, 0),
  ingredientPercentage: 20.5,
  skillPercentage: 5.9,
  berry: LUM,
  genders: BALANCED_GENDER,
  carrySize: 16,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: PURE_OIL,
    b: ROUSING_COFFEE,
    c: HONEY
  },
  skill: EnergyForEveryoneSBerryJuice
});

export const HERACROSS: Pokemon = createSkillSpecialist({
  name: 'HERACROSS',
  pokedexNumber: 214,
  frequency: toSeconds(0, 38, 20),
  ingredientPercentage: 15.8,
  skillPercentage: 4.7,
  berry: LUM,
  genders: BALANCED_GENDER,
  carrySize: 20,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: HONEY,
    b: TASTY_MUSHROOM,
    c: BEAN_SAUSAGE
  },
  skill: CookingAssistSBulkUp
});

export const RAIKOU: Pokemon = createSkillSpecialist({
  name: 'RAIKOU',
  pokedexNumber: 243,
  frequency: toSeconds(0, 35, 0),
  ingredientPercentage: 19.2,
  skillPercentage: 1.9,
  berry: GREPA,
  genders: GENDER_UNKNOWN,
  carrySize: 22,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: BEAN_SAUSAGE,
    b: FIERY_HERB,
    c: LARGE_LEEK
  },
  skill: HelperBoost
});

export const ENTEI: Pokemon = createSkillSpecialist({
  name: 'ENTEI',
  pokedexNumber: 244,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 18.7,
  skillPercentage: 2.3,
  berry: LEPPA,
  genders: GENDER_UNKNOWN,
  carrySize: 19,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: PURE_OIL,
    b: SNOOZY_TOMATO,
    c: TASTY_MUSHROOM
  },
  skill: HelperBoost
});

export const SUICUNE: Pokemon = createSkillSpecialist({
  name: 'SUICUNE',
  pokedexNumber: 245,
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 27.7,
  skillPercentage: 2.6,
  berry: ORAN,
  genders: GENDER_UNKNOWN,
  carrySize: 17,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: FANCY_APPLE,
    b: PURE_OIL,
    c: GREENGRASS_CORN
  },
  skill: HelperBoost
});

export const TREECKO: Pokemon = createSkillSpecialist({
  name: 'TREECKO',
  pokedexNumber: 252,
  frequency: toSeconds(1, 15, 0),
  ingredientPercentage: 17.2,
  skillPercentage: 3.5,
  berry: DURIN,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 8,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: FANCY_EGG,
    b: ROUSING_COFFEE,
    c: LARGE_LEEK
  },
  skill: BerryBurst
});

export const GROVYLE: Pokemon = evolvedPokemon(TREECKO, {
  name: 'GROVYLE',
  pokedexNumber: 253,
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 15,
  skillPercentage: 3.5,
  carrySize: 11
});

export const SCEPTILE: Pokemon = evolvedPokemon(GROVYLE, {
  name: 'SCEPTILE',
  pokedexNumber: 254,
  frequency: toSeconds(0, 38, 20),
  ingredientPercentage: 10.7,
  skillPercentage: 3,
  carrySize: 17
});

export const RALTS: Pokemon = createSkillSpecialist({
  name: 'RALTS',
  pokedexNumber: 280,
  frequency: toSeconds(1, 20, 0),
  ingredientPercentage: 14.5,
  skillPercentage: 4.3,
  berry: MAGO,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: FANCY_APPLE,
    b: GREENGRASS_CORN,
    c: LARGE_LEEK
  },
  skill: EnergyForEveryoneS
});

export const KIRLIA: Pokemon = evolvedPokemon(RALTS, {
  name: 'KIRLIA',
  pokedexNumber: 281,
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 14.6,
  skillPercentage: 4.3,
  carrySize: 13
});

export const GARDEVOIR: Pokemon = evolvedPokemon(KIRLIA, {
  name: 'GARDEVOIR',
  pokedexNumber: 282,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 14.4,
  skillPercentage: 4.2,
  carrySize: 18
});

export const SABLEYE: Pokemon = createSkillSpecialist({
  name: 'SABLEYE',
  pokedexNumber: 302,
  frequency: toSeconds(1, 0, 0),
  ingredientPercentage: 18.8,
  skillPercentage: 6.8,
  berry: WIKI,
  genders: BALANCED_GENDER,
  carrySize: 16,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: PURE_OIL,
    b: TASTY_MUSHROOM,
    c: SOOTHING_CACAO
  },
  skill: DreamShardMagnetSRange
});

export const PLUSLE: Pokemon = createSkillSpecialist({
  name: 'PLUSLE',
  pokedexNumber: 311,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 10.3,
  skillPercentage: 4.9,
  berry: GREPA,
  genders: BALANCED_GENDER,
  carrySize: 16,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: ROUSING_COFFEE,
    b: LARGE_LEEK,
    c: MOOMOO_MILK
  },
  skill: IngredientMagnetSPlusPlusle
});

export const MINUN: Pokemon = createSkillSpecialist({
  name: 'MINUN',
  pokedexNumber: 312,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 17.4,
  skillPercentage: 4.9,
  berry: GREPA,
  genders: BALANCED_GENDER,
  carrySize: 16,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: HONEY,
    b: FANCY_EGG,
    c: MOOMOO_MILK
  },
  skill: CookingPowerUpSMinus
});

export const GULPIN: Pokemon = createSkillSpecialist({
  name: 'GULPIN',
  pokedexNumber: 316,
  frequency: toSeconds(1, 38, 20),
  ingredientPercentage: 21.4,
  skillPercentage: 6.3,
  berry: CHESTO,
  genders: BALANCED_GENDER,
  carrySize: 8,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: GREENGRASS_SOYBEANS,
    b: TASTY_MUSHROOM,
    c: HONEY
  },
  skill: DreamShardMagnetSRange
});

export const SWALOT: Pokemon = evolvedPokemon(GULPIN, {
  name: 'SWALOT',
  pokedexNumber: 317,
  frequency: toSeconds(0, 58, 20),
  ingredientPercentage: 21,
  skillPercentage: 7,
  carrySize: 19
});

export const WYNAUT: Pokemon = preEvolvedPokemon(WOBBUFFET, {
  name: 'WYNAUT',
  pokedexNumber: 360,
  frequency: toSeconds(1, 36, 40),
  ingredientPercentage: 21.3,
  skillPercentage: 6.9,
  carrySize: 7
});

export const SPHEAL_HOLIDAY: Pokemon = createSkillSpecialist({
  name: 'SPHEAL_HOLIDAY',
  pokedexNumber: 363,
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 21.4,
  skillPercentage: 5.0,
  berry: RAWST,
  genders: BALANCED_GENDER,
  carrySize: 20,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: PURE_OIL,
    b: BEAN_SAUSAGE,
    c: WARMING_GINGER
  },
  skill: TastyChanceS
});

export const LATIAS: Pokemon = createSkillSpecialist({
  name: 'LATIAS',
  pokedexNumber: 380,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 11.4,
  skillPercentage: 4.9,
  berry: YACHE,
  genders: FEMALE_ONLY,
  carrySize: 19,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: SNOOZY_TOMATO,
    b: PLUMP_PUMPKIN,
    c: TASTY_MUSHROOM
  },
  skill: EnergizingCheerSHealPulse
});

export const LATIOS: Pokemon = createSkillSpecialist({
  name: 'LATIOS',
  pokedexNumber: 381,
  frequency: toSeconds(0, 46, 40),
  ingredientPercentage: 19.8,
  skillPercentage: 3,
  berry: YACHE,
  genders: MALE_ONLY,
  carrySize: 19,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: SNOOZY_TOMATO,
    b: FANCY_EGG,
    c: MOOMOO_MILK
  },
  skill: BerryBurstDracoMeteor
});

export const TURTWIG: Pokemon = createSkillSpecialist({
  name: 'TURTWIG',
  pokedexNumber: 387,
  frequency: toSeconds(1, 15, 0),
  ingredientPercentage: 13.2,
  skillPercentage: 4.1,
  berry: DURIN,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 12,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: TASTY_MUSHROOM,
    b: SOFT_POTATO,
    c: WARMING_GINGER
  },
  skill: EnergyForEveryoneS
});

export const GROTLE: Pokemon = evolvedPokemon(TURTWIG, {
  name: 'GROTLE',
  pokedexNumber: 388,
  frequency: toSeconds(1, 1, 40),
  ingredientPercentage: 15,
  skillPercentage: 4.6,
  carrySize: 14
});

export const TORTERRA: Pokemon = evolvedPokemon(GROTLE, {
  name: 'TORTERRA',
  pokedexNumber: 389,
  frequency: toSeconds(0, 48, 20),
  ingredientPercentage: 15.6,
  skillPercentage: 4.8,
  berry: FIGY,
  carrySize: 17
});

export const CHIMCHAR: Pokemon = createSkillSpecialist({
  name: 'CHIMCHAR',
  pokedexNumber: 390,
  frequency: toSeconds(1, 8, 20),
  ingredientPercentage: 11.4,
  skillPercentage: 3.3,
  berry: LEPPA,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: FIERY_HERB,
    b: WARMING_GINGER,
    c: ROUSING_COFFEE
  },
  skill: BerryBurst
});

export const MONFERNO: Pokemon = evolvedPokemon(CHIMCHAR, {
  name: 'MONFERNO',
  pokedexNumber: 391,
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 11.4,
  skillPercentage: 3.3,
  berry: CHERI,
  carrySize: 14
});

export const INFERNAPE: Pokemon = evolvedPokemon(MONFERNO, {
  name: 'INFERNAPE',
  pokedexNumber: 392,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 10.6,
  skillPercentage: 3.3,
  carrySize: 18
});

export const BONSLY: Pokemon = preEvolvedPokemon(SUDOWOODO, {
  name: 'BONSLY',
  pokedexNumber: 438,
  frequency: toSeconds(1, 45, 0),
  ingredientPercentage: 18.9,
  skillPercentage: 6.1,
  carrySize: 8
});

export const DRIFLOON: Pokemon = createSkillSpecialist({
  name: 'DRIFLOON',
  pokedexNumber: 425,
  frequency: toSeconds(1, 20, 0),
  ingredientPercentage: 13.7,
  skillPercentage: 7.1,
  berry: BLUK,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: GREENGRASS_CORN,
    b: PURE_OIL,
    c: SOFT_POTATO
  },
  skill: ChargeStrengthSStockpile
});

export const DRIFBLIM: Pokemon = evolvedPokemon(DRIFLOON, {
  name: 'DRIFBLIM',
  pokedexNumber: 426,
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 12.8,
  skillPercentage: 6.3,
  carrySize: 17
});

export const HONCHKROW: Pokemon = evolvedPokemon(MURKROW, {
  name: 'HONCHKROW',
  pokedexNumber: 430,
  frequency: toSeconds(0, 53, 20),
  ingredientPercentage: 14.3,
  skillPercentage: 6.7,
  carrySize: 18
});

export const RIOLU: Pokemon = createSkillSpecialist({
  name: 'RIOLU',
  pokedexNumber: 447,
  frequency: toSeconds(1, 10, 0),
  ingredientPercentage: 12.6,
  skillPercentage: 3.8,
  berry: CHERI,
  genders: SEVEN_EIGHTHS_MALE,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: PURE_OIL,
    b: SOFT_POTATO,
    c: FANCY_EGG
  },
  skill: DreamShardMagnetS
});

export const LUCARIO: Pokemon = evolvedPokemon(RIOLU, {
  name: 'LUCARIO',
  pokedexNumber: 448,
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 15.0,
  skillPercentage: 5.1,
  carrySize: 14,
  skill: DreamShardMagnetSAuraSphere
});

export const MAGNEZONE: Pokemon = evolvedPokemon(MAGNETON, {
  name: 'MAGNEZONE',
  pokedexNumber: 462,
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 17.9,
  skillPercentage: 6.2,
  carrySize: 13
});

export const TOGEKISS: Pokemon = evolvedPokemon(TOGETIC, {
  name: 'TOGEKISS',
  pokedexNumber: 468,
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 15.8,
  skillPercentage: 5.3,
  carrySize: 16
});

export const LEAFEON: Pokemon = evolvedPokemon(EEVEE, {
  name: 'LEAFEON',
  pokedexNumber: 470,
  frequency: toSeconds(0, 50, 0),
  ingredientPercentage: 20.5,
  skillPercentage: 6.9,
  berry: DURIN,
  carrySize: 13,
  skill: EnergizingCheerS
});

export const GLACEON: Pokemon = evolvedPokemon(EEVEE, {
  name: 'GLACEON',
  pokedexNumber: 471,
  frequency: toSeconds(0, 53, 20),
  ingredientPercentage: 21.9,
  skillPercentage: 6.3,
  berry: RAWST,
  carrySize: 12,
  skill: CookingPowerUpS
});

export const GALLADE: Pokemon = evolvedPokemon(KIRLIA, {
  name: 'GALLADE',
  pokedexNumber: 475,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 14.7,
  skillPercentage: 5.4,
  carrySize: 19,
  berry: CHERI,
  genders: MALE_ONLY,
  skill: ExtraHelpfulS
});

export const CRESSELIA: Pokemon = createSkillSpecialist({
  name: 'CRESSELIA',
  pokedexNumber: 488,
  frequency: toSeconds(0, 38, 20),
  ingredientPercentage: 23.9,
  skillPercentage: 4.1,
  berry: MAGO,
  genders: FEMALE_ONLY,
  carrySize: 22,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: WARMING_GINGER,
    b: SOOTHING_CACAO,
    c: SNOOZY_TOMATO
  },
  skill: EnergyForEveryoneSLunarBlessing
});

export const DWEBBLE: Pokemon = createSkillSpecialist({
  name: 'DWEBBLE',
  pokedexNumber: 557,
  frequency: toSeconds(1, 11, 40),
  ingredientPercentage: 17.5,
  skillPercentage: 5.4,
  berry: LUM,
  genders: BALANCED_GENDER,
  carrySize: 8,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: GLOSSY_AVOCADO,
    b: SOFT_POTATO,
    c: PURE_OIL
  },
  skill: IngredientDrawSDwebble
});

export const CRUSTLE: Pokemon = evolvedPokemon(DWEBBLE, {
  name: 'CRUSTLE',
  pokedexNumber: 558,
  frequency: toSeconds(0, 53, 20),
  ingredientPercentage: 23.9,
  skillPercentage: 6.4,
  carrySize: 17
});

export const RUFFLET: Pokemon = createSkillSpecialist({
  name: 'RUFFLET',
  pokedexNumber: 627,
  frequency: toSeconds(1, 3, 20),
  ingredientPercentage: 12.5,
  skillPercentage: 3.1,
  berry: PAMTRE,
  genders: MALE_ONLY,
  carrySize: 10,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: BEAN_SAUSAGE,
    b: GREENGRASS_CORN,
    c: ROUSING_COFFEE
  },
  skill: BerryBurst
});

export const BRAVIARY: Pokemon = evolvedPokemon(RUFFLET, {
  name: 'BRAVIARY',
  pokedexNumber: 628,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 12.1,
  skillPercentage: 3.5,
  carrySize: 18
});

export const SYLVEON: Pokemon = evolvedPokemon(EEVEE, {
  name: 'SYLVEON',
  pokedexNumber: 700,
  frequency: toSeconds(0, 43, 20),
  ingredientPercentage: 17.8,
  skillPercentage: 4.0,
  berry: PECHA,
  carrySize: 15,
  skill: EnergyForEveryoneS
});

export const HAWLUCHA: Pokemon = createSkillSpecialist({
  name: 'HAWLUCHA',
  pokedexNumber: 701,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 19.2,
  skillPercentage: 5.2,
  berry: PAMTRE,
  genders: BALANCED_GENDER,
  carrySize: 21,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: FIERY_HERB,
    b: WARMING_GINGER,
    c: BEAN_SAUSAGE
  },
  skill: IngredientDrawSHawlucha
});

export const DEDENNE: Pokemon = createSkillSpecialist({
  name: 'DEDENNE',
  pokedexNumber: 702,
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 17.7,
  skillPercentage: 4.5,
  berry: GREPA,
  genders: BALANCED_GENDER,
  carrySize: 19,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: FANCY_APPLE,
    b: SOOTHING_CACAO,
    c: GREENGRASS_CORN
  },
  skill: TastyChanceS
});

export const NOIBAT: Pokemon = createSkillSpecialist({
  name: 'NOIBAT',
  pokedexNumber: 714,
  frequency: toSeconds(1, 25, 0),
  ingredientPercentage: 19.8,
  skillPercentage: 4.8,
  berry: YACHE,
  genders: BALANCED_GENDER,
  carrySize: 7,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: FANCY_APPLE,
    b: LARGE_LEEK,
    c: BEAN_SAUSAGE
  },
  skill: ChargeStrengthM
});

export const NOIVERN: Pokemon = evolvedPokemon(NOIBAT, {
  name: 'NOIVERN',
  pokedexNumber: 715,
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 19.5,
  skillPercentage: 4.8,
  carrySize: 18
});

export const TOGEDEMARU: Pokemon = createSkillSpecialist({
  name: 'TOGEDEMARU',
  pokedexNumber: 777,
  frequency: toSeconds(0, 45, 0),
  ingredientPercentage: 16.9,
  skillPercentage: 5.4,
  berry: BELUE,
  genders: BALANCED_GENDER,
  carrySize: 18,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: MOOMOO_MILK,
    b: GLOSSY_AVOCADO,
    c: SOOTHING_CACAO
  },
  skill: EnergizingCheerSNuzzle
});

export const MIMIKYU: Pokemon = createSkillSpecialist({
  name: 'MIMIKYU',
  pokedexNumber: 778,
  frequency: toSeconds(0, 41, 40),
  ingredientPercentage: 15.3,
  skillPercentage: 3.5,
  berry: BLUK,
  genders: BALANCED_GENDER,
  carrySize: 19,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredients: {
    a: FANCY_APPLE,
    b: ROUSING_COFFEE,
    c: TASTY_MUSHROOM
  },
  skill: BerryBurstDisguise
});

export const TOXEL: Pokemon = createSkillSpecialist({
  name: 'TOXEL',
  pokedexNumber: 848,
  frequency: toSeconds(1, 33, 20),
  ingredientPercentage: 20.9,
  skillPercentage: 4.8,
  berry: CHESTO,
  genders: BALANCED_GENDER,
  carrySize: 6,
  previousEvolutions: 0,
  remainingEvolutions: 1,
  ingredients: {
    a: MOOMOO_MILK,
    b: FANCY_APPLE,
    c: LARGE_LEEK
  },
  skill: IngredientMagnetS
});

export const TOXTRICITY_AMPED: Pokemon = evolvedPokemon(TOXEL, {
  name: 'TOXTRICITY_AMPED',
  pokedexNumber: 849,
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 23.9,
  skillPercentage: 6.4,
  carrySize: 18,
  skill: IngredientMagnetSPlusToxtricity
});

export const TOXTRICITY_LOW_KEY: Pokemon = evolvedPokemon(TOXEL, {
  name: 'TOXTRICITY_LOW_KEY',
  pokedexNumber: 849,
  frequency: toSeconds(0, 51, 40),
  ingredientPercentage: 23.9,
  skillPercentage: 6.4,
  carrySize: 18,
  skill: CookingPowerUpSMinus
});

export const PAWMI: Pokemon = createSkillSpecialist({
  name: 'PAWMI',
  pokedexNumber: 921,
  frequency: toSeconds(1, 16, 40),
  ingredientPercentage: 11.1,
  skillPercentage: 3.6,
  berry: GREPA,
  genders: BALANCED_GENDER,
  carrySize: 9,
  previousEvolutions: 0,
  remainingEvolutions: 2,
  ingredients: {
    a: SOOTHING_CACAO,
    b: MOOMOO_MILK,
    c: FANCY_EGG
  },
  skill: EnergyForEveryoneS
});

export const PAWMO: Pokemon = evolvedPokemon(PAWMI, {
  name: 'PAWMO',
  pokedexNumber: 922,
  frequency: toSeconds(0, 55, 0),
  ingredientPercentage: 10.9,
  skillPercentage: 3.6,
  carrySize: 12
});

export const PAWMOT: Pokemon = evolvedPokemon(PAWMO, {
  name: 'PAWMOT',
  pokedexNumber: 923,
  frequency: toSeconds(0, 40, 0),
  ingredientPercentage: 14.1,
  skillPercentage: 3.9,
  carrySize: 18
});
