import { BadRequestError } from '@src/domain/error/api/api-error.js';
import { SolveService } from '@src/services/solve/solve-service.js';
import type { SolveRecipeInput, SolveRecipeResultWithSettings } from '@src/services/solve/types/solution-types.js';
import { BunUtils } from '@src/utils/bun-utils/bun-utils.js';
import { getMeal } from '@src/utils/meal-utils/meal-utils.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import type {
  IngredientIndexToIntAmount,
  IngredientSet,
  Recipe,
  RecipeTeamSolution,
  SolveRecipeRequest,
  SolveRecipeResponse,
  SolveSettings,
  SolveSettingsExt,
  SurplusIngredients,
  TeamMemberExt,
  TeamMemberSettings,
  TeamMemberSettingsExt,
  TeamMemberWithProduce
} from 'sleepapi-common';
import {
  flatToIngredientSet,
  getIngredient,
  getNature,
  getPokemon,
  ingredientSetToIntFlat,
  MAX_TEAM_SIZE
} from 'sleepapi-common';

export default class SolveController {
  public solveRecipe(name: string, input: SolveRecipeRequest): SolveRecipeResponse {
    if (input.includedMembers && input.includedMembers?.length > MAX_TEAM_SIZE) {
      throw new BadRequestError("Can't solve a recipe with more than 5 team members");
    }
    const result = SolveService.solveRecipe(getMeal(name), this.parseInput(input));
    BunUtils.garbageCollect();
    return this.resultToResponse(result, name);
  }

  public solveIngredient(name: string, settings: SolveSettings) {
    return SolveService.solveIngredient(getIngredient(name), this.enrichSolveSettings(settings));
  }

  private parseInput(input: SolveRecipeRequest): SolveRecipeInput {
    const includedMembers: TeamMemberExt[] =
      input.includedMembers?.map((member) => ({
        pokemonWithIngredients: {
          pokemon: getPokemon(member.pokemonWithIngredients.pokemon),
          ingredientList: flatToIngredientSet(member.pokemonWithIngredients.ingredients)
        },
        settings: this.enrichMemberSettings(member.settings)
      })) ?? [];
    const maxTeamSize = MAX_TEAM_SIZE; // default to this, but we might want to limit further in future
    return {
      solveSettings: this.enrichSolveSettings(input.settings),
      includedMembers,
      maxTeamSize
    };
  }

  private enrichSolveSettings(settings: SolveSettings): SolveSettingsExt {
    const { camp, level } = settings;
    const bedtime = TimeUtils.parseTime(settings.bedtime);
    const wakeup = TimeUtils.parseTime(settings.wakeup);
    const sleepDuration = TimeUtils.calculateDuration({ start: bedtime, end: wakeup });
    const dayDuration = TimeUtils.calculateDuration({ start: wakeup, end: bedtime });
    if (sleepDuration.hour < 1 || dayDuration.hour < 1) {
      throw new BadRequestError('Minimum 1 hour of sleep and daytime required');
    }
    return {
      camp,
      level,
      bedtime,
      wakeup
    };
  }

  private enrichMemberSettings(settings: TeamMemberSettings): TeamMemberSettingsExt {
    const { level, carrySize, externalId, ribbon, skillLevel } = settings;
    const subskills = new Set(settings.subskills);
    const nature = getNature(settings.nature);
    return {
      carrySize,
      externalId,
      level,
      nature,
      ribbon,
      skillLevel,
      subskills
    };
  }

  private resultToResponse(result: SolveRecipeResultWithSettings, recipe: string): SolveRecipeResponse {
    const teams: RecipeTeamSolution[] = [];
    for (const team of result.teams) {
      const members: TeamMemberWithProduce[] = [];

      for (const member of team.members) {
        members.push({
          member: {
            pokemonWithIngredients: {
              pokemon: getPokemon(member.pokemonSet.pokemon),
              ingredientList: member.ingredientList
            },
            settings: member.settings
          },
          producedIngredients: flatToIngredientSet(member.totalIngredients)
        });
      }

      const surplus = this.calculateSurplus(team.producedIngredients, getMeal(recipe));

      teams.push({
        members,
        producedIngredients: flatToIngredientSet(team.producedIngredients),
        surplus
      });
    }

    return {
      exhaustive: result.exhaustive,
      teams
    };
  }

  private calculateSurplus(ingredients: IngredientIndexToIntAmount, recipe: Recipe): SurplusIngredients {
    const recipeIngredients = ingredientSetToIntFlat(recipe.ingredients);
    const total: IngredientSet[] = flatToIngredientSet(ingredients._mapSubClamp(recipeIngredients));

    const recipeIngredientNames = new Set(recipe.ingredients.map((ing) => ing.ingredient.name));

    return {
      relevant: total.filter(({ ingredient }) => recipeIngredientNames.has(ingredient.name)),
      extra: total.filter(({ ingredient }) => !recipeIngredientNames.has(ingredient.name)),
      total
    };
  }

  /**
   * Provides access to private methods for testing purposes.
   * This method allows unit tests to call and verify the behavior of private methods.
   */
  public _testAccess() {
    return {
      enrichSolveSettings: this.enrichSolveSettings.bind(this),
      enrichMemberSettings: this.enrichMemberSettings.bind(this),
      resultToResponse: this.resultToResponse.bind(this)
    };
  }
}
