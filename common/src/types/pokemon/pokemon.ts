/**
 * Base skill% and ing% from Mathcord RP data project: https://docs.google.com/spreadsheets/d/1kBrPl0pdAO8gjOf_NrTgAPseFtqQA27fdfEbMBBeAhs/edit?usp=sharing
 */

import type { Berry } from '../berry/berry';
import type { GenderRatio } from '../gender';
import type { IngredientIndexToIntAmount, IngredientSet, IngredientSetSimple } from '../ingredient/ingredient';
import type { Mainskill } from '../mainskill/mainskill';

export type PokemonSpecialty = 'berry' | 'ingredient' | 'skill' | 'all';
export interface Pokemon {
  name: string;
  displayName: string;
  pokedexNumber: number;
  specialty: PokemonSpecialty;
  frequency: number;
  ingredientPercentage: number;
  skillPercentage: number;
  berry: Berry;
  genders: GenderRatio;
  carrySize: number;
  previousEvolutions: number;
  remainingEvolutions: number;
  evolvesFrom?: string;
  evolvesInto: string[];
  ingredient0: IngredientSet[];
  ingredient30: IngredientSet[];
  ingredient60: IngredientSet[];
  skill: Mainskill;
  pityProcThreshold: number;
  shinyLocked?: boolean;
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
  ingredients: IngredientIndexToIntAmount;
};
export type PokemonWithIngredientsSimple = {
  pokemon: string;
  ingredientList: IngredientSetSimple[];
};
export type PokemonWithIngredients = {
  pokemon: Pokemon;
  ingredientList: IngredientSet[];
};
