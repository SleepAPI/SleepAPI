import { PokemonIngredientSet, nature, subskill } from '..';

export interface PokemonStats {
  level: number;
  nature: nature.Nature;
  subskills: subskill.SubSkill[];
  skillLevel: number;
}

export interface PokemonInput {
  pokemonSet: PokemonIngredientSet;
  stats: PokemonStats;
}
