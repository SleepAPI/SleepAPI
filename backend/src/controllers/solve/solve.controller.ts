import { BadRequestError } from '@src/domain/error/api/api-error.js';
import { SolveService } from '@src/services/solve/solve-service.js';
import type { SolveRecipeInput, SolveRecipeResultWithSettings } from '@src/services/solve/types/solution-types.js';
import { getMeal } from '@src/utils/meal-utils/meal-utils.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import type {
  IngredientIndexToIntAmount,
  IngredientSet,
  IslandInstance,
  IslandInstanceDto,
  Recipe,
  RecipeTeamSolution,
  SolveRecipeRequest,
  SolveRecipeResponse,
  SolveSettings,
  SolveSettingsDto,
  SurplusIngredients,
  TeamMember,
  TeamMemberSettings,
  TeamMemberSettingsDto,
  TeamMemberWithProduce
} from 'sleepapi-common';
import {
  emptyIngredientInventoryFloat,
  flatToIngredientSet,
  getIngredient,
  getIsland,
  getNature,
  getPokemon,
  ingredientSetToIntFlat,
  MAX_POT_SIZE,
  MAX_TEAM_SIZE,
  parseTime
} from 'sleepapi-common';

export default class SolveController {
  public solveRecipe(name: string, input: SolveRecipeRequest): SolveRecipeResponse {
    if (input.includedMembers && input.includedMembers?.length > MAX_TEAM_SIZE) {
      throw new BadRequestError("Can't solve a recipe with more than 5 team members");
    }
    const result = SolveService.solveRecipe(getMeal(name), this.parseInput(input));
    return this.resultToResponse(result, name);
  }

  public solveIngredient(name: string, settings: SolveSettingsDto) {
    return SolveService.solveIngredient(getIngredient(name), this.enrichSolveSettings(settings));
  }

  private parseInput(input: SolveRecipeRequest): SolveRecipeInput {
    const includedMembers: TeamMember[] =
      input.includedMembers?.map((member) => {
        const pokemon = getPokemon(member.pokemonWithIngredients.pokemon);
        return {
          pokemonWithIngredients: {
            pokemon,
            ingredientList: flatToIngredientSet(member.pokemonWithIngredients.ingredients)
          },
          settings: this.enrichMemberSettings(member.settings)
        };
      }) ?? [];
    const maxTeamSize = MAX_TEAM_SIZE; // default to this, but we might want to limit further in future
    return {
      solveSettings: this.enrichSolveSettings(input.settings),
      includedMembers,
      maxTeamSize
    };
  }

  private enrichSolveSettings(settings: SolveSettingsDto): SolveSettings {
    const { camp, level } = settings;
    const bedtime = parseTime(settings.bedtime);
    const wakeup = parseTime(settings.wakeup);
    const sleepDuration = TimeUtils.calculateDuration({ start: bedtime, end: wakeup });
    const dayDuration = TimeUtils.calculateDuration({ start: wakeup, end: bedtime });
    if (sleepDuration.hour < 1 || dayDuration.hour < 1) {
      throw new BadRequestError('Minimum 1 hour of sleep and daytime required');
    }

    return {
      camp,
      level,
      bedtime,
      wakeup,
      includeCooking: false,
      stockpiledIngredients: emptyIngredientInventoryFloat(),
      potSize: MAX_POT_SIZE, // doesn't matter since we're solving a specific recipe
      island: this.parseIsland(settings.island)
    };
  }

  private parseIsland(islandInstance: IslandInstanceDto): IslandInstance {
    const island = getIsland(islandInstance.shortName);
    if (island.expert) {
      return {
        ...island,
        areaBonus: islandInstance.areaBonus,
        berries: islandInstance.berries,
        expertMode: islandInstance.expertMode
      };
    } else {
      return {
        ...island,
        areaBonus: islandInstance.areaBonus
      };
    }
  }

  private enrichMemberSettings(settings: TeamMemberSettingsDto): TeamMemberSettings {
    const { level, carrySize, externalId, ribbon, skillLevel, sneakySnacking } = settings;
    const subskills = new Set(settings.subskills);
    const nature = getNature(settings.nature);
    return {
      carrySize,
      externalId,
      level,
      nature,
      ribbon,
      skillLevel,
      subskills,
      sneakySnacking
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
