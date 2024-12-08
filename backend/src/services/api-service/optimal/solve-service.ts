import {
  Ingredient,
  ingredientSetToIntFlat,
  OPTIMAL_POKEDEX,
  Recipe,
  SolveSettingsExt,
  TeamMemberExt
} from 'sleepapi-common';

export interface SolveRecipeInput {
  includedMembers: TeamMemberExt[];
  solveSettings: SolveSettingsExt;
  maxTeamSize: number;
}
class SolveServiceImpl {
  // TODO: subtract the includeMembers ingredients from recipe and send the rest to set cover
  // TODO: subtract maxTeamSize with the number of includeMembers
  public solveRecipe(recipe: Recipe, input: SolveRecipeInput) {
    const flatRecipeIngredients = ingredientSetToIntFlat(recipe.ingredients);

    const includedMembers: TeamMemberExt[] = [];
    if (input.includedMembers) {
      for (const includedMember of input.includedMembers) {
        //
      }
    }

    // TODO: if includedMembers includes helper boost then remove them from pokedex

    // TODO: for all pokemon that don't have a support skill and dont match helper boost in the team we should be able to put them in the same team
    // TODO: this should significantly speed up calculation
    for (const pkmn of OPTIMAL_POKEDEX) {
      //
    }

    const maxTeamSize = input.maxTeamSize - includedMembers.length;
  }

  public solveIngredient(ingredient: Ingredient, settings: SolveSettingsExt) {
    //
  }
}

export const SolveService = new SolveServiceImpl();
