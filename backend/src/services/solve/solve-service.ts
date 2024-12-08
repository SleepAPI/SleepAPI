import { SetCover } from '@src/services/solve/set-cover.js';
import {
  ProducersByIngredientIndex,
  SetCoverPokemonSetup
} from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import { SolveRecipeSolution, SolveRecipeSolutionWithSettings } from '@src/services/solve/types/solution-types.js';
import {
  calculateProductionAll,
  combineProduction,
  createSettingsLookupTable,
  enrichSolutions,
  groupProducersByIngredientIndex,
  pokemonProductionToRecipeSolutions
} from '@src/services/solve/utils/solve-utils.js';
import {
  Ingredient,
  ingredientSetToIntFlat,
  Recipe,
  SolveSettingsExt,
  TeamMemberExt,
  TeamMemberSettingsExt
} from 'sleepapi-common';

export interface SetCoverPokemonWithSettings extends SetCoverPokemonSetup {
  settings: TeamMemberSettingsExt;
}
export interface SolveRecipeInput {
  includedMembers: TeamMemberExt[];
  solveSettings: SolveSettingsExt;
  maxTeamSize: number;
}
export interface SolveRecipeResult {
  teams: SolveRecipeSolution[];
  exhaustive: boolean;
}
export interface SolveRecipeResultWithSettings {
  teams: SolveRecipeSolutionWithSettings[];
  exhaustive: boolean;
}
// TODO: maybe consider breaking out private functions into separate class
class SolveServiceImpl {
  // TEST
  public solveRecipe(recipe: Recipe, input: SolveRecipeInput): SolveRecipeResultWithSettings {
    const flatRecipeIngredients = ingredientSetToIntFlat(recipe.ingredients);

    const { userProduction, nonSupportProduction, supportProduction } = calculateProductionAll({
      settings: input.solveSettings,
      userIncludedMembers: input.includedMembers
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
    const settingsCache: Map<string, SetCoverPokemonWithSettings> = createSettingsLookupTable(allProducers);

    const cache = new Map();
    const maxTeamSize = input.maxTeamSize - input.includedMembers.length;
    const setCover = new SetCover(producersByIngredientIndex, cache);
    const solutions = setCover.solveRecipe(flatRecipeIngredients, maxTeamSize);

    return enrichSolutions(solutions, settingsCache);
  }

  // TODO: remove error ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public solveIngredient(ingredient: Ingredient, settings: SolveSettingsExt) {
    //
  }
}

export const SolveService = new SolveServiceImpl();
