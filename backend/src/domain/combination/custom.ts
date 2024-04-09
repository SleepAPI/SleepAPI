import { nature, PokemonIngredientSet, subskill } from 'sleepapi-common';
import { DetailedProduce, Produce } from './produce';

export interface CustomStats {
  level: number;
  nature: nature.Nature;
  subskills: subskill.SubSkill[];
  skillLevel: number;
  maxCarrySize: number;
}

export interface CustomPokemonCombinationWithProduce {
  pokemonCombination: PokemonIngredientSet;
  detailedProduce: DetailedProduce;
  averageProduce: Produce;
  customStats: CustomStats;
}
