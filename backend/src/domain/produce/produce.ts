import { BerryDrop } from './berry';
import { IngredientDrop } from './ingredient';

export interface Produce {
  berries: BerryDrop;
  ingredients: IngredientDrop[];
}

export interface DetailedProduce {
  produce: Produce;
  spilledIngredients: IngredientDrop[];
  sneakySnack: BerryDrop;
  helpsBeforeSS: number;
  helpsAfterSS: number;
}
