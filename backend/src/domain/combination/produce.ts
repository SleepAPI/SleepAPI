import { BerrySet, IngredientSet, pokemon } from 'sleepapi-common';

export interface Produce {
  berries: BerrySet;
  ingredients: IngredientSet[];
}

export interface PokemonProduce {
  pokemon: pokemon.Pokemon;
  produce: Produce;
}

export interface DetailedProduce {
  produce: Produce;
  spilledIngredients: IngredientSet[];
  sneakySnack: BerrySet;
  dayHelps: number;
  nightHelps: number;
  averageTotalSkillProcs: number;
}
