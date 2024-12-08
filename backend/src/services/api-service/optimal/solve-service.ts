import { Ingredient, ingredientSetToFlat, Recipe } from 'sleepapi-common';

export interface SetCoverInput {
  includeMembers: string[];
}

class SolveServiceImpl {
  // TODO: subtract the includeMembers ingredients from recipe and send the rest to set cover
  // TODO: subtract maxTeamSize with the number of includeMembers
  public solveRecipe(params: { recipe: Recipe; input: SetCoverInput }) {
    const { recipe, input } = params;

    const flatRecipeIngredients = ingredientSetToFlat(recipe.ingredients);
  }

  public solveIngredient(params: { ingredient: Ingredient; input: SetCoverInput }) {
    //
  }
}

export const SolveService = new SolveServiceImpl();
