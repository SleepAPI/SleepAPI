import { DetailedProduce, nature, PokemonIngredientSet, Produce, subskill } from 'sleepapi-common';

export interface CustomStats {
  level: number;
  ribbon: number;
  nature: nature.Nature;
  subskills: subskill.SubSkill[];
  skillLevel: number;
  inventoryLimit: number;
}

export interface CustomPokemonCombinationWithProduce {
  pokemonCombination: PokemonIngredientSet;
  detailedProduce: DetailedProduce;
  averageProduce: Produce;
  customStats: CustomStats;
}
