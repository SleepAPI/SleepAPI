import {
  calculateSimple,
  calculateTeam,
  SimpleTeamResult
} from '@src/services/api-service/production/production-service.js';
import { getAllIngredientLists } from '@src/services/calculator/ingredient/ingredient-calculate.js';
import { SetCoverPokemonSetup } from '@src/services/set-cover/set-cover-new.js';
import { TeamSimulatorUtils } from '@src/services/simulation-service/team-simulator/team-simulator-utils.js';
import { splitArrayByCondition } from '@src/utils/database-utils/array-utils.js';
import {
  CATERPIE,
  COMPLETE_POKEDEX,
  emptyIngredientInventoryInt,
  Ingredient,
  INGREDIENT_SUPPORT_MAINSKILLS,
  IngredientIndexToIntAmount,
  IngredientSet,
  ingredientSetToFloatFlat,
  ingredientSetToIntFlat,
  MAX_TEAM_SIZE,
  MEALS_IN_DAY,
  nature,
  Optimal,
  OPTIMAL_POKEDEX,
  Pokemon,
  PokemonWithIngredients,
  Recipe,
  SolveSettingsExt,
  TeamMemberExt
} from 'sleepapi-common';

export interface SolveRecipeInput {
  includedMembers: TeamMemberExt[];
  solveSettings: SolveSettingsExt;
  maxTeamSize: number;
}
// TODO: can tier list also use SolveService, but maybe solveRecipes? To solve all recipes?
class SolveServiceImpl {
  // TODO: subtract the includeMembers ingredients from recipe and send the rest to set cover
  // TODO: subtract maxTeamSize with the number of includeMembers
  public solveRecipe(recipe: Recipe, input: SolveRecipeInput) {
    const flatRecipeIngredients = ingredientSetToIntFlat(recipe.ingredients);

    // TODO: if includedMembers includes helper boost then remove them from pokedex

    // TODO: for all pokemon that don't have a support skill and dont match helper boost in the team we should be able to put them in the same team
    // TODO: this should significantly speed up calculation
    for (const pkmn of OPTIMAL_POKEDEX) {
      //
    }

    const maxTeamSize = input.maxTeamSize - input.includedMembers.length;
  }

  public solveIngredient(ingredient: Ingredient, settings: SolveSettingsExt) {
    //
  }

  // TODO: the tier list is going to do the same thing, so we should move this to a shared service
  private calculateProductionAll(params: { settings: SolveSettingsExt; members: TeamMemberExt[] }): {
    userProduction: SetCoverPokemonSetup[];
    nonSupportProduction: SetCoverPokemonSetup[];
    supportProduction: SetCoverPokemonSetup[];
  } {
    const { settings, members } = params;
    // TODO:
    // - split pokemon in support mons and not
    // - make sure team sim supports more than 5 mons
    // - iterate both groups, add mon to members, calc
    // - for each mon we can use helps instead of recalcing ingredient lists

    const filteredPokedex = this.filterPokedex(members);

    const [supportMons, nonSupportMons] = splitArrayByCondition(filteredPokedex, (pkmn) =>
      INGREDIENT_SUPPORT_MAINSKILLS.some((skill) => skill.isSkill(pkmn.skill))
    );

    const nonSupportMembers = this.pokedexToMembers({ pokedex: nonSupportMons, support: false, level: settings.level });
    const supportMembers = this.pokedexToMembers({ pokedex: supportMons, support: true, level: settings.level });

    const userIncludedProduction = calculateTeam({ settings, members }, 1400, false);
    const nonSupportProductionStats = calculateSimple({ settings, members: [...members, ...nonSupportMembers] });
    // TODO:
    const supportProductionStats: SimpleTeamResult[] = [];
    for (let i = 0; i < supportMembers.length; ++i) {
      const supportMember = supportMembers[i];
      const emptyTeamSpace = MAX_TEAM_SIZE - (members.length + 1); // user mons + the support member we're calculating
      const simpleResults = calculateSimple({
        settings,
        members: [...members, supportMember, ...this.bogusMembers(emptyTeamSpace)]
      });
      const simpleResult = simpleResults.find(
        (result) => result.externalId === supportMember.pokemonWithIngredients.pokemon.name
      );
      simpleResult && supportProductionStats.push(simpleResult);
    }

    const userProduction: SetCoverPokemonSetup[] = userIncludedProduction.members.map((member) => ({
      pokemonSet: member.pokemonWithIngredients,
      totalIngredients: ingredientSetToIntFlat(member.produceTotal.ingredients)
    }));

    const nonSupportProduction: SetCoverPokemonSetup[] =
      this.convertSimpleStatsToIngredientSets(nonSupportProductionStats);
    const supportProduction: SetCoverPokemonSetup[] = this.convertSimpleStatsToIngredientSets(supportProductionStats);

    return { userProduction, nonSupportProduction, supportProduction };
  }

  /**
   * Filters Pokédex to return relevant Pokémon for the solve.
   * Currently only make sure we remove any legendaries (helper boost) if the included user Pokémon already have them
   */
  private filterPokedex(members: TeamMemberExt[]) {
    const memberNames = new Set(members.map((member) => member.pokemonWithIngredients.pokemon.name));
    return COMPLETE_POKEDEX.filter((pkmn) => !memberNames.has(pkmn.name));
  }

  private pokedexToMembers(params: { pokedex: Pokemon[]; support: boolean; level: number }): TeamMemberExt[] {
    const { pokedex, support, level } = params;
    const pokedexAsMembers: TeamMemberExt[] = [];

    for (let i = 0; i < pokedex.length; ++i) {
      const pkmn = pokedex[i];
      const AAA: IngredientSet[] = [pkmn.ingredient0, pkmn.ingredient30[0], pkmn.ingredient60[0]];
      const pokemonWithIngredients: PokemonWithIngredients = { pokemon: pkmn, ingredientList: AAA };

      const INGREDIENT_SUPPORT_MAINSKILLS_SET = new Set(INGREDIENT_SUPPORT_MAINSKILLS.map((ms) => ms.name));
      const isSupportSkillMon = support && INGREDIENT_SUPPORT_MAINSKILLS_SET.has(pkmn.skill.name);
      const optimalSettings: Optimal = isSupportSkillMon ? Optimal.skill(pkmn) : Optimal.ingredient(pkmn);
      const settings = Optimal.toMemberSettings({ stats: optimalSettings, level, externalId: pkmn.name });

      pokedexAsMembers.push({ settings, pokemonWithIngredients });
    }
    return pokedexAsMembers;
  }

  // TODO: we should do a proper mocked pokemon, or use a flat to fake full team in the sim
  private bogusMembers(nrOfMembers: number) {
    const bogusMember: TeamMemberExt = {
      pokemonWithIngredients: { pokemon: CATERPIE, ingredientList: [] },
      settings: {
        carrySize: 0,
        externalId: 'mock',
        level: 1,
        nature: nature.BASHFUL,
        ribbon: 0,
        skillLevel: 1,
        subskills: new Set()
      }
    };
    return new Array(nrOfMembers).fill(bogusMember);
  }

  private convertSimpleStatsToIngredientSets(simpleResults: SimpleTeamResult[], level: number): SetCoverPokemonSetup[] {
    const result: SetCoverPokemonSetup[] = [];
    for (const simpleResult of simpleResults) {
      const pokemon = simpleResult.member.pokemonWithIngredients.pokemon;
      let helpsPerMealWindow = simpleResult.totalHelps / MEALS_IN_DAY;
      let skillProcsPerMealWindow = 0;
      let totalIngredients: IngredientIndexToIntAmount = emptyIngredientInventoryInt();

      // TODO: if getPokemon is slow we can return it as part of SimpleResult in the sim
      for (const ingredientList of getAllIngredientLists(pokemon, level)) {
        const memberWithIngList: TeamMemberExt = {
          pokemonWithIngredients: { pokemon, ingredientList },
          settings: simpleResult.member.settings
        };
        const averageProduce = TeamSimulatorUtils.calculateAverageProduce(memberWithIngList);

        result.push({
          pokemonSet: { pokemon: pokemon.name, ingredients: ingredientSetToIntFlat(ingredientList) },
          // TODO: double-check logic and convert to uint8arrray (or 16?) by using util in array-utils
          totalIngredients: averageProduce.ingredients
            ._mutateUnary((ing) => ing * helpsPerMealWindow)
            ._mutateCombine(ingredientSetToFloatFlat(simpleResult.skillIngredients), (a, b) => a + b)
        });
      }
    }
  }
}

export const SolveService = new SolveServiceImpl();
