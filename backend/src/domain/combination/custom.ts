import { nature, PokemonIngredientSet, subskill } from 'sleepapi-common';
import { DetailedProduce } from './produce';

export interface CustomStats {
  level: number;
  nature: nature.Nature;
  subskills: subskill.SubSkill[];
  skillLevel: number;
}

export interface CustomPokemonCombinationWithProduce {
  pokemonCombination: PokemonIngredientSet;
  detailedProduce: DetailedProduce;
  customStats: CustomStats;
}
