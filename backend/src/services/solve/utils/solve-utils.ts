import { ProgrammingError } from '@src/domain/error/programming/programming-error.js';
import {
  calculateSimple,
  calculateTeam,
  SimpleTeamResult
} from '@src/services/api-service/production/production-service.js';
import { getAllIngredientLists } from '@src/services/calculator/ingredient/ingredient-calculate.js';
import { TeamSimulatorUtils } from '@src/services/simulation-service/team-simulator/team-simulator-utils.js';
import {
  SetCoverPokemonWithSettings,
  SolveRecipeResult,
  SolveRecipeResultWithSettings
} from '@src/services/solve/solve-service.js';
import {
  ProducersByIngredientIndex,
  SetCoverPokemonSetup
} from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import { SolveRecipeSolutionWithSettings } from '@src/services/solve/types/solution-types.js';
import { convertFloat32ToInt16, splitArrayByCondition } from '@src/utils/database-utils/array-utils.js';
import { mockTeamMemberExt } from '@src/vitest/mocks/team/mock-team-member-ext.js';
import {
  ingredient,
  INGREDIENT_SUPPORT_MAINSKILLS,
  IngredientSet,
  ingredientSetToFloatFlat,
  ingredientSetToIntFlat,
  mainskill,
  MAX_TEAM_SIZE,
  MEALS_IN_DAY,
  Optimal,
  OPTIMAL_POKEDEX,
  Pokedex,
  PokemonWithIngredients,
  PokemonWithIngredientsIndexed,
  SolveSettingsExt,
  TeamMemberExt,
  TeamSettingsExt
} from 'sleepapi-common';

export function calculateProductionAll(params: { settings: SolveSettingsExt; userIncludedMembers: TeamMemberExt[] }): {
  userProduction: SetCoverPokemonWithSettings[];
  nonSupportProduction: SetCoverPokemonWithSettings[];
  supportProduction: SetCoverPokemonWithSettings[];
} {
  const { settings, userIncludedMembers: members } = params;

  const filteredPokedex = filterPokedex(members);

  const [supportMons, nonSupportMons] = splitArrayByCondition(filteredPokedex, (pkmn) =>
    INGREDIENT_SUPPORT_MAINSKILLS.some((skill) => skill.isSkill(pkmn.skill))
  );

  const nonSupportMembers = pokedexToMembers({ pokedex: nonSupportMons, support: false, level: settings.level });
  const supportMembers = pokedexToMembers({ pokedex: supportMons, support: true, level: settings.level });

  const userIncludedProduction = calculateTeam({ settings, members }, 1400, false);
  const nonSupportProductionStats = calculateSimple({ settings, members: [...members, ...nonSupportMembers] });
  const supportProductionStats: SimpleTeamResult[] = calculateSupportPokemon({
    supportMembers,
    settings,
    userMembers: members
  });

  const userProduction: SetCoverPokemonWithSettings[] = userIncludedProduction.members.map((member) => ({
    pokemonSet: member.pokemonWithIngredients,
    totalIngredients: ingredientSetToIntFlat(member.produceTotal.ingredients),
    settings: members.find((m) => m.settings.externalId === member.externalId)!.settings
  }));

  const nonSupportProduction = convertSimpleStatsToIngredientSets(nonSupportProductionStats);
  const supportProduction = convertSimpleStatsToIngredientSets(supportProductionStats);

  return { userProduction, nonSupportProduction, supportProduction };
}

/**
 * Filters Pokédex to return relevant Pokémon for the solve.
 * Currently only make sure we remove any legendaries (helper boost) if the included user Pokémon already have them
 */
export function filterPokedex(members: TeamMemberExt[]) {
  const helperBoostIncludedMembers = new Set(
    members._collect(
      (member) => member.pokemonWithIngredients.pokemon.skill.isSameOrModifiedVersionOf(mainskill.HELPER_BOOST),
      (member) => member.pokemonWithIngredients.pokemon.name
    )
  );
  if (helperBoostIncludedMembers.size > 0) {
    return OPTIMAL_POKEDEX.filter((pkmn) => !helperBoostIncludedMembers.has(pkmn.name));
  } else return OPTIMAL_POKEDEX;
}

/**
 * Converts a Pokedex into an array of `TeamMemberExt` objects with optimal settings and ingredients.
 *
 * This function processes each Pokémon in the Pokedex to create a corresponding `TeamMemberExt` object.
 * For each Pokémon, an `AAA` ingredient list is generated, and either ingredient-focused or skill-focused
 * settings are applied based on specific criteria.
 *
 * @param {Pokedex} params.pokedex - The Pokedex array containing Pokémon data.
 * @param {boolean} params.support - Determines if support-focused settings should be applied.
 *        When `true`, skill-focused settings are prioritized for Pokémon with a supporting skill.
 * @param {number} params.level - The level to assign to all team members.
 * @returns {TeamMemberExt[]} An array of `TeamMemberExt` objects, where each object represents:
 *        - Optimal settings for the Pokémon, based on its type and role.
 *        - A derived `AAA` ingredient list containing ingredients for different skill thresholds.
 *
 * ### Behavior:
 * - Generates one `TeamMemberExt` per Pokémon in the Pokedex.
 * - Applies ingredient-focused subskills and nature by default.
 * - Conditionally uses skill-focused subskills when all of the following are true:
 *   1. `params.support` is `true`.
 *   2. The Pokémon is classified as a skill specialist.
 *   3. The Pokémon's skill belongs to the set of predefined supporting skills (e.g., "E4E", "Extra Helpful").
 */
export function pokedexToMembers(params: { pokedex: Pokedex; support: boolean; level: number }): TeamMemberExt[] {
  const { pokedex, support, level } = params;
  const pokedexAsMembers: TeamMemberExt[] = [];

  const INGREDIENT_SUPPORT_MAINSKILLS_SET = new Set(INGREDIENT_SUPPORT_MAINSKILLS.map((ms) => ms.name));
  for (let i = 0; i < pokedex.length; ++i) {
    const pkmn = pokedex[i];
    const AAA: IngredientSet[] = [pkmn.ingredient0, pkmn.ingredient30[0], pkmn.ingredient60[0]];
    const pokemonWithIngredients: PokemonWithIngredients = { pokemon: pkmn, ingredientList: AAA };

    const isSupportSkillMon = support && INGREDIENT_SUPPORT_MAINSKILLS_SET.has(pkmn.skill.name);
    const optimalSettings: Optimal = isSupportSkillMon ? Optimal.skill(pkmn, 4) : Optimal.ingredient(pkmn, 4);
    const settings = Optimal.toMemberSettings({ stats: optimalSettings, level, externalId: pkmn.name });

    pokedexAsMembers.push({ settings, pokemonWithIngredients });
  }
  return pokedexAsMembers;
}

export function calculateSupportPokemon(params: {
  supportMembers: TeamMemberExt[];
  userMembers: TeamMemberExt[];
  settings: TeamSettingsExt;
}): SimpleTeamResult[] {
  const { supportMembers, userMembers, settings } = params;
  const supportProductionStats: SimpleTeamResult[] = [];
  for (let i = 0; i < supportMembers.length; ++i) {
    const supportMember = supportMembers[i];
    const emptyTeamSpace = MAX_TEAM_SIZE - (userMembers.length + 1); // user mons + the support member we're calculating
    const simpleResults = calculateSimple({
      settings,
      members: [...userMembers, supportMember, ...bogusMembers(emptyTeamSpace)]
    });
    const simpleResult = simpleResults.find(
      (result) =>
        result.member.pokemonWithIngredients.pokemon.name === supportMember.pokemonWithIngredients.pokemon.name
    );
    simpleResult && supportProductionStats.push(simpleResult);
  }
  return supportProductionStats;
}

export function convertSimpleStatsToIngredientSets(simpleResults: SimpleTeamResult[]): SetCoverPokemonWithSettings[] {
  const result: SetCoverPokemonWithSettings[] = [];
  for (const simpleResult of simpleResults) {
    const pokemon = simpleResult.member.pokemonWithIngredients.pokemon;
    const helpsPerMealWindow = simpleResult.totalHelps / MEALS_IN_DAY;

    for (const ingredientList of getAllIngredientLists(pokemon, simpleResult.member.settings.level)) {
      const memberWithIngList: TeamMemberExt = {
        pokemonWithIngredients: { pokemon, ingredientList },
        settings: simpleResult.member.settings
      };
      const averageProduce = TeamSimulatorUtils.calculateAverageProduce(memberWithIngList);

      result.push({
        pokemonSet: { pokemon: pokemon.name, ingredients: ingredientSetToIntFlat(ingredientList) },
        totalIngredients: convertFloat32ToInt16(
          averageProduce.ingredients
            ._mutateUnary((ing) => ing * helpsPerMealWindow)
            ._mutateCombine(ingredientSetToFloatFlat(simpleResult.skillIngredients), (a, b) => a + b)
        ),
        settings: simpleResult.member.settings
      });
    }
  }
  return result;
}

export function groupProducersByIngredientIndex(producers: SetCoverPokemonSetup[]): ProducersByIngredientIndex {
  const result: ProducersByIngredientIndex = Array.from({ length: ingredient.TOTAL_NUMBER_OF_INGREDIENTS }, () => []);
  for (let producerIndex = 0; producerIndex < producers.length; ++producerIndex) {
    const producer = producers[producerIndex];
    for (let ingredientIndex = 0; ingredientIndex < ingredient.TOTAL_NUMBER_OF_INGREDIENTS; ++ingredientIndex) {
      const producedIngredient = producer.totalIngredients[ingredientIndex];
      if (producedIngredient > 0) {
        result[ingredientIndex].push(producer);
      }
    }
  }

  // for every ingredient sort the producers DESC by the amount of that ingredient
  for (let i = 0; i < ingredient.TOTAL_NUMBER_OF_INGREDIENTS; ++i) {
    const ingredientProducers = result[i];
    ingredientProducers.sort((a, b) => b.totalIngredients[i] - a.totalIngredients[i]);
  }
  return result;
}

export function pokemonProductionToRecipeSolutions(
  production: SetCoverPokemonWithSettings[]
): SolveRecipeSolutionWithSettings {
  const combinedProduction = combineProduction(production);

  return {
    members: production,
    producedIngredients: combinedProduction
  };
}

export function createSettingsLookupTable(
  pokemonWithSettings: SetCoverPokemonWithSettings[]
): Map<string, SetCoverPokemonWithSettings> {
  const map: Map<string, SetCoverPokemonWithSettings> = new Map();
  for (const pkmn of pokemonWithSettings) {
    map.set(hashPokemonSetIndexed(pkmn.pokemonSet), pkmn);
  }
  return map;
}

export function combineProduction(members: SetCoverPokemonSetup[]) {
  return members.reduce(
    (acc: Int16Array, curr) => acc._mutateAdd(curr.totalIngredients),
    new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS)
  );
}

export function bogusMembers(nrOfMembers: number): TeamMemberExt[] {
  const bogusMember: TeamMemberExt = mockTeamMemberExt();
  return new Array(nrOfMembers).fill(bogusMember);
}

export function hashPokemonSetIndexed(pokemonSet: PokemonWithIngredientsIndexed) {
  const ingredientsHash = Array.from(pokemonSet.ingredients).join(',');
  return `${pokemonSet.pokemon}:${ingredientsHash}`;
}

export function enrichSolutions(
  result: SolveRecipeResult,
  settingsCache: Map<string, SetCoverPokemonWithSettings>
): SolveRecipeResultWithSettings {
  const enrichedTeams: SolveRecipeSolutionWithSettings[] = [];
  for (const team of result.teams) {
    const enrichedMembers = [];
    for (const member of team.members) {
      const settings = settingsCache.get(hashPokemonSetIndexed(member.pokemonSet))?.settings;
      if (!settings) {
        throw new ProgrammingError(
          `Settings cached didn't contain settings for ${hashPokemonSetIndexed(member.pokemonSet)}`
        );
      }

      enrichedMembers.push({
        pokemonSet: member.pokemonSet,
        totalIngredients: member.totalIngredients,
        settings
      });
    }
    enrichedTeams.push({
      members: enrichedMembers,
      producedIngredients: team.producedIngredients
    });
  }
  return {
    exhaustive: result.exhaustive,
    teams: enrichedTeams
  };
}
