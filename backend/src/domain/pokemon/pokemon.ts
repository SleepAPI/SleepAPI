/**
 * Base ing% from Mathcord RP data project: https://docs.google.com/spreadsheets/d/1kBrPl0pdAO8gjOf_NrTgAPseFtqQA27fdfEbMBBeAhs/edit?usp=sharing
 * Base skill% from Raenonx: https://pks.raenonx.cc/en/info/production
 *
 * Skill% is very experimental, and even Raenon seems to change values with big jumps frequently, lots of Pokémon also have no skill% on Raenon
 * Mathcord RP project has not published any skill% values yet
 * Skill% is currently not used in Sleep API for this reason
 */

import { Berry } from '../produce/berry';
import { IngredientDrop } from '../produce/ingredient';
import { MainSkill } from '../stat/mainskill';
import { BERRY_SPECIALISTS } from './berry-pokemon';
import { INGREDIENT_SPECIALISTS } from './ingredient-pokemon';
import { SKILL_SPECIALISTS } from './skill-pokemon';

export interface Pokemon {
  name: string;
  specialty: 'berry' | 'ingredient' | 'skill';
  frequency: number;
  ingredientPercentage: number;
  skillPercentage: number;
  berry: Berry;
  carrySize: number;
  maxCarrySize: number;
  ingredient0: IngredientDrop;
  ingredient30: IngredientDrop[];
  ingredient60: IngredientDrop[];
  skill: MainSkill;
}

export const POKEDEX: Pokemon[] = [...BERRY_SPECIALISTS, ...INGREDIENT_SPECIALISTS, ...SKILL_SPECIALISTS];
