import { SERIOUS } from '../domain/nature/nature';
import { RAIKOU } from '../domain/pokemon/skill-pokemon';
import {
  HELPING_SPEED_M,
  INVENTORY_L,
  SKILL_LEVEL_UP_M,
  SKILL_TRIGGER_M,
  SLEEP_EXP_BONUS,
} from '../domain/subskill/subskill';
import { PokemonInput } from '../domain/types/stats';

// skills
export const TASTY_CHANCE_S_CAP = 0.7;

// recipe
export const MAX_RECIPE_LEVEL = 55;

// cooking
export const MAX_POT_SIZE = 57;
export const MEALS_IN_DAY = 3;
export const WEEKDAY_CRIT_CHANCE = 0.1;
export const WEEKDAY_CRIT_MULTIPLIER = 2;
export const SUNDAY_CRIT_CHANCE = 0.3;
export const SUNDAY_CRIT_MULTIPLIER = 3;

// default legendaries
export const DEFAULT_RAIKOU: PokemonInput = {
  pokemonSet: {
    pokemon: RAIKOU,
    ingredientList: [RAIKOU.ingredient0, RAIKOU.ingredient30[1], RAIKOU.ingredient60[1]],
  },
  stats: {
    level: 30,
    nature: SERIOUS,
    skillLevel: 3,
    subskills: [SLEEP_EXP_BONUS, SKILL_LEVEL_UP_M, INVENTORY_L, HELPING_SPEED_M, SKILL_TRIGGER_M],
  },
};
