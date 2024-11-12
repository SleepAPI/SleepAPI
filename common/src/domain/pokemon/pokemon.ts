/**
 * Base skill% and ing% from Mathcord RP data project: https://docs.google.com/spreadsheets/d/1kBrPl0pdAO8gjOf_NrTgAPseFtqQA27fdfEbMBBeAhs/edit?usp=sharing
 */

import { BELUE, Berry } from '../berry/berry';
import { BALANCED_GENDER, GenderRatio } from '../gender';
import { SLOWPOKE_TAIL } from '../ingredient';
import { Mainskill } from '../mainskill/mainskill';
import { HELPER_BOOST } from '../mainskill/mainskills/helper-boost';
import { IngredientSet } from '../types';
import { ALL_BERRY_SPECIALISTS, INFERIOR_BERRY_SPECIALISTS, OPTIMAL_BERRY_SPECIALISTS } from './berry-pokemon';
import {
  ALL_INGREDIENT_SPECIALISTS,
  INFERIOR_INGREDIENT_SPECIALISTS,
  OPTIMAL_INGREDIENT_SPECIALISTS,
} from './ingredient-pokemon';
import { ALL_SKILL_SPECIALISTS, INFERIOR_SKILL_SPECIALISTS, OPTIMAL_SKILL_SPECIALISTS } from './skill-pokemon';

export type PokemonSpecialty = 'berry' | 'ingredient' | 'skill';
export interface Pokemon {
  name: string;
  specialty: PokemonSpecialty;
  frequency: number;
  ingredientPercentage: number;
  skillPercentage: number;
  berry: Berry;
  genders: GenderRatio;
  carrySize: number;
  previousEvolutions: number;
  remainingEvolutions: number;
  ingredient0: IngredientSet;
  ingredient30: IngredientSet[];
  ingredient60: IngredientSet[];
  skill: Mainskill;
}

export const MOCK_POKEMON: Pokemon = {
  name: 'Mockemon',
  specialty: 'berry',
  frequency: 0,
  ingredientPercentage: 0,
  skillPercentage: 0,
  berry: BELUE,
  genders: BALANCED_GENDER,
  carrySize: 0,
  previousEvolutions: 0,
  remainingEvolutions: 0,
  ingredient0: { amount: 0, ingredient: SLOWPOKE_TAIL },
  ingredient30: [{ amount: 0, ingredient: SLOWPOKE_TAIL }],
  ingredient60: [{ amount: 0, ingredient: SLOWPOKE_TAIL }],
  skill: HELPER_BOOST,
};

export const OPTIMAL_POKEDEX: Pokemon[] = [
  ...OPTIMAL_BERRY_SPECIALISTS,
  ...OPTIMAL_INGREDIENT_SPECIALISTS,
  ...OPTIMAL_SKILL_SPECIALISTS,
];

export const INFERIOR_POKEDEX: Pokemon[] = [
  ...INFERIOR_BERRY_SPECIALISTS,
  ...INFERIOR_INGREDIENT_SPECIALISTS,
  ...INFERIOR_SKILL_SPECIALISTS,
];

export const COMPLETE_POKEDEX: Pokemon[] = [
  ...ALL_BERRY_SPECIALISTS,
  ...ALL_INGREDIENT_SPECIALISTS,
  ...ALL_SKILL_SPECIALISTS,
];
