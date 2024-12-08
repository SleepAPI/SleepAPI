import { SolveService } from '@src/services/api-service/optimal/solve-service.js';
import { SolveRecipeRequest } from 'sleepapi-common';

export default class SolveController {
  public async solveRecipe(name: string, input: SolveRecipeRequest) {
    return SolveService.solveRecipe(name, this.#parseInput(input));
  }

  public async getOptimalPokemonForIngredientRaw(name: string, input: SolveRecipeRequest) {
    return findOptimalMonsForIngredient(name, this.#parseInput(input));
  }

  #parseInput(input: SolveRecipeRequest) {
    // TODO: when calculating the production for every mon, it should use a team with the required mons in there
    // TODO: this would make it auto work with Raikou etc

    // TODO: if includeMembers includes a helper boost mon, then remove those from allowed pokemon

    const level = input.level ?? 60;

    return {
      level,
      ribbon: input.ribbon ?? 4,
      nature: input.nature ? getNature(input.nature) : undefined,
      subskills: input.subskills && limitSubSkillsToLevel(input.subskills.map(getSubskill), level),
      islandBerries: getBerriesForIsland(findIslandForName(input.island)),
      camp: input.camp === true,
      mainBedtime: TimeUtils.parseTime('21:30'),
      mainWakeup: TimeUtils.parseTime('06:00')
    };
  }
}
