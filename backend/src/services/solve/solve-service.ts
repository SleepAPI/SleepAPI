import { SetCover } from '@src/services/solve/set-cover.js';
import type { SetCoverPokemonSetupWithSettings } from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import type { SolveRecipeInput, SolveRecipeResultWithSettings } from '@src/services/solve/types/solution-types.js';
import {
  calculateProductionAll,
  combineProduction,
  createSettingsLookupTable,
  enrichSolutions,
  groupProducersByIngredient,
  pokemonProductionToRecipeSolutions
} from '@src/services/solve/utils/solve-utils.js';
import type { Ingredient, Recipe, SolveSettings } from 'sleepapi-common';
import { ingredientSetToIntFlat } from 'sleepapi-common';

class SolveServiceImpl {
  public solveRecipe(recipe: Recipe, input: SolveRecipeInput): SolveRecipeResultWithSettings {
    const flatRecipeIngredients = ingredientSetToIntFlat(recipe.ingredients);

    // TODO: is calculateProductionAll the bottleneck now? Is set cover fast now?
    const { userProduction, nonSupportProduction, supportProduction } = calculateProductionAll({
      settings: input.solveSettings,
      userMembers: input.includedMembers,
      userRecipes: {
        curries: [],
        desserts: [],
        salads: []
      }
    });

    // remove user's ingredients from recipe
    const combinedUserProduction = combineProduction(userProduction);

    flatRecipeIngredients._mutateSubClamp(combinedUserProduction);

    // TODO: if we calc the user's team first we can potentially avoid calcing all other mons
    // checks if user's team already solves the recipe alone, if so just return it right away
    if (!flatRecipeIngredients.some((ing) => ing > 0)) {
      return {
        exhaustive: true,
        teams: [pokemonProductionToRecipeSolutions(userProduction)]
      };
    }

    const allProducers = [...nonSupportProduction, ...supportProduction];
    const producersByIngredientIndex = groupProducersByIngredient(allProducers);
    const settingsCache: Map<string, SetCoverPokemonSetupWithSettings> = createSettingsLookupTable(allProducers);

    const cache = new Map();
    const maxTeamSize = input.maxTeamSize - input.includedMembers.length;
    const setCover = new SetCover(allProducers, producersByIngredientIndex, cache);
    const solutions = setCover.solveRecipe(flatRecipeIngredients, maxTeamSize);

    return enrichSolutions(solutions, settingsCache);
  }

  // TODO: Implement for new site
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public solveIngredient(ingredient: Ingredient, settings: SolveSettings) {
    //
  }
}

export const SolveService = new SolveServiceImpl();
