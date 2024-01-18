import { DetailedProduce } from '../produce/produce';
import { Nature } from '../stat/nature';
import { SubSkill } from '../stat/subskill';
import { PokemonCombination } from './combination';

export interface CustomStats {
  level: number;
  nature: Nature;
  subskills: SubSkill[];
}

export interface CustomPokemonCombinationWithProduce {
  pokemonCombination: PokemonCombination;
  detailedProduce: DetailedProduce;
  customStats: CustomStats;
}
