import { BadRequestError } from '@src/domain/error/api/api-error.js';
import { SolveRecipeInput, SolveRecipeResultWithSettings, SolveService } from '@src/services/solve/solve-service.js';
import { getMeal } from '@src/utils/meal-utils/meal-utils.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import {
  flatToIngredientSet,
  getIngredient,
  getNature,
  getPokemon,
  MAX_TEAM_SIZE,
  SolveRecipeRequest,
  SolveRecipeResponse,
  SolveSettings,
  SolveSettingsExt,
  TeamMemberExt,
  TeamMemberSettings,
  TeamMemberSettingsExt,
  TeamMemberWithProduce,
  TeamSolution
} from 'sleepapi-common';

export default class SolveController {
  public async solveRecipe(name: string, input: SolveRecipeRequest): Promise<SolveRecipeResponse> {
    if (input.includedMembers && input.includedMembers?.length > 5) {
      throw new BadRequestError("Can't solve a recipe with more than 5 team members");
    }
    const result = SolveService.solveRecipe(getMeal(name), this.parseInput(input));
    return this.resultToResponse(result);
  }

  public async solveIngredient(name: string, settings: SolveSettings) {
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

  // TODO: remove in Sleep API 2.0— NOTE:  probably not needed
  private resultToResponse(result: SolveRecipeResultWithSettings): SolveRecipeResponse {
    const teams: TeamSolution[] = [];
    for (const team of result.teams) {
      const members: TeamMemberWithProduce[] = [];
      for (const member of team.members) {
        members.push({
          member: {
            pokemonWithIngredients: {
              pokemon: getPokemon(member.pokemonSet.pokemon),
              ingredientList: flatToIngredientSet(member.pokemonSet.ingredients)
            },
            settings: member.settings
          },
          producedIngredients: flatToIngredientSet(member.totalIngredients)
        });
      }
      teams.push({
        members,
        producedIngredients: flatToIngredientSet(team.producedIngredients)
      });
    }

    return {
      exhaustive: result.exhaustive,
      teams
    };
  }

  /**
   * Trick or exposing functions for testing
   */
  public _testAccess() {
    return {
      enrichSolveSettings: this.enrichSolveSettings.bind(this),
      enrichMemberSettings: this.enrichMemberSettings.bind(this),
      resultToResponse: this.resultToResponse.bind(this)
    };
  }
}
