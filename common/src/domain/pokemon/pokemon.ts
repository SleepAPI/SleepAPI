/**
 * Base skill% and ing% from Mathcord RP data project: https://docs.google.com/spreadsheets/d/1kBrPl0pdAO8gjOf_NrTgAPseFtqQA27fdfEbMBBeAhs/edit?usp=sharing
 */

import { Berry } from '../berry/berry';
import { MainSkill } from '../mainskill/mainskill';
import { IngredientSet } from '../types';
import { ALL_BERRY_SPECIALISTS, INFERIOR_BERRY_SPECIALISTS, OPTIMAL_BERRY_SPECIALISTS } from './berry-pokemon';
import {
  ALL_INGREDIENT_SPECIALISTS,
  INFERIOR_INGREDIENT_SPECIALISTS,
  OPTIMAL_INGREDIENT_SPECIALISTS,
} from './ingredient-pokemon';
import { ALL_SKILL_SPECIALISTS, INFERIOR_SKILL_SPECIALISTS, OPTIMAL_SKILL_SPECIALISTS } from './skill-pokemon';

export interface Pokemon {
  name: string;
  specialty: 'berry' | 'ingredient' | 'skill';
  frequency: number;
  ingredientPercentage: number;
  skillPercentage: number;
  berry: Berry; // TODO: should be BerrySet
  carrySize: number;
  maxCarrySize: number;
  ingredient0: IngredientSet;
  ingredient30: IngredientSet[];
  ingredient60: IngredientSet[];
  skill: MainSkill;
}

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
