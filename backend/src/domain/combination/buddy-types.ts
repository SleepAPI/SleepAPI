import { IngredientDrop } from '../produce/ingredient';

export type BuddyForMeal = {
  meal: string;
  bonus: number;
  value: number;
  recipe: IngredientDrop[];
  combinations: {
    percentage: number;
    contributed_power: number;
    buddy1_pokemon: string;
    buddy1_ingredientList: IngredientDrop[];
    buddy1_producedIngredients: IngredientDrop[];
    buddy2_pokemon: string;
    buddy2_ingredientList: IngredientDrop[];
    buddy2_producedIngredients: IngredientDrop[];
  }[];
};

// --- /buddy/flexible --- //
export type BuddyForFlexibleRanking = {
  average_percentage: number;
  buddy1_pokemon: string;
  buddy1_ingredientList: IngredientDrop[];
  buddy2_pokemon: string;
  buddy2_ingredientList: IngredientDrop[];
};
