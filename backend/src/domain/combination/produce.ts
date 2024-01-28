import { BerrySet, IngredientSet } from 'sleepapi-common';

export interface Produce {
  berries: BerrySet;
  ingredients: IngredientSet[];
}

export interface DetailedProduce {
  produce: Produce;
  spilledIngredients: IngredientSet[];
  sneakySnack: BerrySet;
  helpsBeforeSS: number;
  helpsAfterSS: number;
}
