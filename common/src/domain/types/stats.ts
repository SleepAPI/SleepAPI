import { PokemonIngredientSet, nature, subskill } from '..';
import { Pokemon } from '../pokemon';

export interface PokemonStats {
  level: number;
  nature: nature.Nature;
  subskills: subskill.SubSkill[];
  skillLevel: number;
}

export enum IngredientList {
  AAA = 1,
  AAB,
  AAC,
  ABA,
  ABB,
  ABC,
}

export interface PokemonIngredientList {
  pokemon: Pokemon;
  ingredientList: IngredientList;
}

export interface PokemonInput {
  pokemonSet: PokemonIngredientSet;
  stats: PokemonStats;
}
