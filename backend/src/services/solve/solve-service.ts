import { SetCover } from '@src/services/solve/set-cover.js';
import type {
  ProducersByIngredientIndex,
  SetCoverPokemonSetupWithSettings
} from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import type { SolveRecipeInput, SolveRecipeResultWithSettings } from '@src/services/solve/types/solution-types.js';
import {
  calculateProductionAll,
  combineProduction,
  createSettingsLookupTable,
  enrichSolutions,
  groupProducersByIngredientIndex,
  pokemonProductionToRecipeSolutions
} from '@src/services/solve/utils/solve-utils.js';
import type { Ingredient, Recipe, SolveSettingsExt } from 'sleepapi-common';
import { ingredientSetToIntFlat } from 'sleepapi-common';

// TODO: maybe consider breaking out private functions into separate class
class SolveServiceImpl {
  // TEST
  // TEST: Make sure we don't calculate other pokemon if user pokemon are 5, since nothing more fits in team anyway
  public solveRecipe(recipe: Recipe, input: SolveRecipeInput): SolveRecipeResultWithSettings {
    const flatRecipeIngredients = ingredientSetToIntFlat(recipe.ingredients);

    // TODO: is calculateProductionAll the bottleneck now? Is set cover fast now?
    const { userProduction, nonSupportProduction, supportProduction } = calculateProductionAll({
      settings: input.solveSettings,
      userMembers: input.includedMembers,
      includeCooking: false
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
    const producersByIngredientIndex: ProducersByIngredientIndex = groupProducersByIngredientIndex(allProducers);
    const settingsCache: Map<string, SetCoverPokemonSetupWithSettings> = createSettingsLookupTable(allProducers);

    const cache = new Map();
    const maxTeamSize = input.maxTeamSize - input.includedMembers.length;
    const setCover = new SetCover(producersByIngredientIndex, cache);
    const solutions = setCover.solveRecipe(flatRecipeIngredients, maxTeamSize);
    setCover.reset();
    cache.clear();

    return enrichSolutions(solutions, settingsCache);
  }

  // TODO: remove error ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public solveIngredient(ingredient: Ingredient, settings: SolveSettingsExt) {
    //
  }
}

export const SolveService = new SolveServiceImpl();
