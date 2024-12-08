/**
 * Base skill% and ing% from Mathcord RP data project: https://docs.google.com/spreadsheets/d/1kBrPl0pdAO8gjOf_NrTgAPseFtqQA27fdfEbMBBeAhs/edit?usp=sharing
 */

import { BELUE } from '../berry/berries';
import { Berry } from '../berry/berry';
import { BALANCED_GENDER, GenderRatio } from '../gender';
import { IngredientIndexToAmount, IngredientSet } from '../ingredient/ingredient';
import { SLOWPOKE_TAIL } from '../ingredient/ingredients';
import { Mainskill } from '../mainskill/mainskill';
import { HELPER_BOOST } from '../mainskill/mainskills/helper-boost';
import { ALL_BERRY_SPECIALISTS, INFERIOR_BERRY_SPECIALISTS, OPTIMAL_BERRY_SPECIALISTS } from './berry-pokemon';
import {
  ALL_INGREDIENT_SPECIALISTS,
  INFERIOR_INGREDIENT_SPECIALISTS,
  OPTIMAL_INGREDIENT_SPECIALISTS
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

/**
 * Advanced type
 * Requires initialization of 0 for all ingredients the pokemon does not produce
 *
 * @example By pre-defining the Float array size it will set 0 for all missing indices, then we can populate the indices we want
 * const TOTAL_INGREDIENTS = INGREDIENTS.length;
 * const pikachuIngredients = new Float32Array(TOTAL_INGREDIENTS);
 * pikachuIngredients[ingredient.FANCY_APPLE.index] = 3.5;
 * pikachuIngredients[ingredient.WARMING_GINGER.index] = 7.2;
 */
export type PokemonWithIngredientsIndexed = {
  pokemon: string;
  ingredients: IngredientIndexToAmount;
};
export type PokemonWithIngredients = {
  pokemon: Pokemon;
  ingredientList: IngredientSet[];
};

// TODO: move
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
  skill: HELPER_BOOST
};

// TODO: move to pokedex.ts
export const OPTIMAL_POKEDEX: Pokemon[] = [
  ...OPTIMAL_BERRY_SPECIALISTS,
  ...OPTIMAL_INGREDIENT_SPECIALISTS,
  ...OPTIMAL_SKILL_SPECIALISTS
];

export const INFERIOR_POKEDEX: Pokemon[] = [
  ...INFERIOR_BERRY_SPECIALISTS,
  ...INFERIOR_INGREDIENT_SPECIALISTS,
  ...INFERIOR_SKILL_SPECIALISTS
];

export const COMPLETE_POKEDEX: Pokemon[] = [
  ...ALL_BERRY_SPECIALISTS,
  ...ALL_INGREDIENT_SPECIALISTS,
  ...ALL_SKILL_SPECIALISTS
];
