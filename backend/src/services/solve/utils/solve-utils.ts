import { ProgrammingError } from '@src/domain/error/programming/programming-error.js';
import { calculateSimple, calculateTeam } from '@src/services/api-service/production/production-service.js';
import type { UserRecipes } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-utils.js';
import { TeamSimulatorUtils } from '@src/services/simulation-service/team-simulator/team-simulator-utils.js';
import type {
  IngredientProducers,
  IngredientProducersWithSettings,
  SetCoverPokemonSetup,
  SetCoverPokemonSetupWithSettings
} from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import type {
  SolveRecipeResult,
  SolveRecipeResultWithSettings,
  SolveRecipeSolutionWithSettings
} from '@src/services/solve/types/solution-types.js';
import { mocks } from '@src/vitest/index.js';
import type {
  IngredientIndexToFloatAmount,
  IngredientSet,
  Pokedex,
  Pokemon,
  PokemonWithIngredients,
  PokemonWithIngredientsIndexed,
  SimpleTeamResult,
  SolveSettings,
  TeamMember,
  TeamMemberSettings,
  TeamMemberSettingsResult,
  TeamSettings
} from 'sleepapi-common';
import {
  CarrySizeUtils,
  convertFloat32ToInt16,
  CookingAssistS,
  CookingAssistSBulkUp,
  CookingPowerUpS,
  getAllIngredientLists,
  hasSpecialty,
  HelperBoost,
  ingredient,
  INGREDIENT_SUPPORT_MAINSKILLS,
  IngredientDrawSSuperLuck,
  IngredientMagnetS,
  ingredientSetToFloatFlat,
  ingredientSetToIntFlat,
  MAX_TEAM_SIZE,
  MEALS_IN_DAY,
  Optimal,
  OPTIMAL_POKEDEX,
  splitArrayByCondition,
  TastyChanceS
} from 'sleepapi-common';

export function calculateProductionAll(params: {
  settings: SolveSettings;
  userMembers: TeamMember[];
  userRecipes: UserRecipes;
}): {
  userProduction: SetCoverPokemonSetupWithSettings[];
  nonSupportProduction: SetCoverPokemonSetupWithSettings[];
  supportProduction: SetCoverPokemonSetupWithSettings[];
} {
  const { settings, userMembers, userRecipes } = params;

  const filteredPokedex = filterPokedex(userMembers);

  const [supportMons, nonSupportMons] = splitArrayByCondition(filteredPokedex, (pkmn) =>
    INGREDIENT_SUPPORT_MAINSKILLS.some((skill) => skill.is(pkmn.skill))
  );

  const nonSupportMembers = pokedexToMembers({
    pokedex: nonSupportMons,
    level: settings.level,
    camp: settings.camp
  });

  const userIncludedProduction = calculateTeam(
    { settings: { ...settings, includeCooking: true }, members: userMembers, userRecipes },
    1400
  );

  const nonSupportProductionStats = calculateNonSupportPokemon({
    nonSupportMembers,
    settings,
    userMembers,
    userRecipes
  });

  const supportMembers = pokedexToMembers({ pokedex: supportMons, level: settings.level, camp: settings.camp });
  const supportProductionStats: SimpleTeamResult[] = calculateSupportPokemon({
    supportMembers,
    settings,
    userMembers,
    userRecipes
  });
  const supportProduction = convertAAAToAllIngredientSets(
    supportProductionStats.map((member) => ({
      averageHelps: member.totalHelps,
      critMultiplier: member.critMultiplier,
      averageWeekdayPotSize: member.averageWeekdayPotSize,
      pokemon: member.member.pokemonWithIngredients.pokemon,
      settings: member.member.settings,
      skillIngredients: member.skillIngredients
    }))
  );

  // TODO: refactor into function
  // TODO: avoid !
  const userProduction: SetCoverPokemonSetupWithSettings[] = userIncludedProduction.members.map((member) => ({
    pokemonSet: member.pokemonWithIngredients,
    totalIngredients: ingredientSetToIntFlat(member.produceTotal.ingredients)._mutateUnary((ing) => ing / MEALS_IN_DAY),
    ingredientList: userMembers.find((m) => m.settings.externalId === member.externalId)!.pokemonWithIngredients
      .ingredientList,
    critMultiplier: userIncludedProduction.cooking!.critInfo.averageCritMultiplierPerCook,
    averageWeekdayPotSize: userIncludedProduction.cooking!.critInfo.averageWeekdayPotSize,
    skillIngredients: ingredientSetToFloatFlat(member.produceFromSkill.ingredients),
    averageHelps: member.advanced.averageHelps,
    totalIngredientsFloat: ingredientSetToFloatFlat(member.produceTotal.ingredients)._mutateUnary(
      (ing) => ing / MEALS_IN_DAY
    ),
    settings: settingsToArraySubskills(userMembers.find((m) => m.settings.externalId === member.externalId)!.settings)
  }));

  const nonSupportProduction = convertAAAToAllIngredientSets(
    nonSupportProductionStats.map((member) => ({
      averageHelps: member.totalHelps,
      critMultiplier: member.critMultiplier,
      averageWeekdayPotSize: member.averageWeekdayPotSize,
      pokemon: member.member.pokemonWithIngredients.pokemon,
      settings: member.member.settings,
      skillIngredients: member.skillIngredients
    }))
  );

  return { userProduction, nonSupportProduction, supportProduction };
}

export function settingsToArraySubskills(settings: TeamMemberSettings): TeamMemberSettingsResult {
  return { ...settings, subskills: [...settings.subskills] };
}

/**
 * Filters Pokédex to return relevant Pokémon for the solve.
 * Currently only make sure we remove any legendaries (helper boost) if the included user Pokémon already have them
 */
export function filterPokedex(members: TeamMember[]) {
  const helperBoostIncludedMembers = new Set(
    members
      .filter((member) => member.pokemonWithIngredients.pokemon.skill.is(HelperBoost))
      .map((member) => member.pokemonWithIngredients.pokemon.name)
  );
  if (helperBoostIncludedMembers.size > 0) {
    return OPTIMAL_POKEDEX.filter((pkmn) => !helperBoostIncludedMembers.has(pkmn.name));
  } else return OPTIMAL_POKEDEX;
}

/**
 * Converts a Pokedex into an array of `TeamMember` objects with optimal settings and ingredients.
 *
 * This function processes each Pokémon in the Pokedex to create a corresponding `TeamMember` object.
 * For each Pokémon, an `AAA` ingredient list is generated, and either ingredient-focused or skill-focused
 * settings are applied based on specific criteria.
 *
 * @param {Pokedex} params.pokedex - The Pokedex array containing Pokémon data.
 * @param {boolean} params.support - Determines if support-focused settings should be applied.
 *        When `true`, skill-focused settings are prioritized for Pokémon with a supporting skill.
 * @param {number} params.level - The level to assign to all team members.
 * @returns {TeamMember[]} An array of `TeamMember` objects, where each object represents:
 *        - Optimal settings for the Pokémon, based on its type and role.
 *        - A derived `AAA` ingredient list containing ingredients for different skill thresholds.
 *
 * ### Behavior:
 * - Generates one `TeamMember` per Pokémon in the Pokedex.
 * - Applies ingredient-focused subskills and nature by default.
 * - Conditionally uses skill-focused subskills when all of the following are true:
 *   1. `params.support` is `true`.
 *   2. The Pokémon is classified as a skill specialist.
 *   3. The Pokémon's skill belongs to the set of predefined supporting skills (e.g., "E4E", "Extra Helpful").
 */
export function pokedexToMembers(params: { pokedex: Pokedex; level: number; camp: boolean }): TeamMember[] {
  const { pokedex, level, camp } = params;
  const pokedexAsMembers: TeamMember[] = [];

  const INGREDIENT_SUPPORT_MAINSKILLS_SET = new Set(INGREDIENT_SUPPORT_MAINSKILLS.map((ms) => ms.name));
  // TODO: there needs to be a better way to do this
  // TODO: also misleading variable name since we really only filter here to figure out which skill mons we should give skill setup vs keeping ingredient setup
  INGREDIENT_SUPPORT_MAINSKILLS_SET.add(TastyChanceS.name);
  INGREDIENT_SUPPORT_MAINSKILLS_SET.add(IngredientMagnetS.name);
  INGREDIENT_SUPPORT_MAINSKILLS_SET.add(CookingAssistS.name);
  INGREDIENT_SUPPORT_MAINSKILLS_SET.add(CookingAssistSBulkUp.name);
  INGREDIENT_SUPPORT_MAINSKILLS_SET.add(CookingPowerUpS.name);
  INGREDIENT_SUPPORT_MAINSKILLS_SET.add(IngredientDrawSSuperLuck.name);
  for (let i = 0; i < pokedex.length; ++i) {
    const pkmn = pokedex[i];

    const AAA: IngredientSet[] = [
      pkmn.ingredient0[0],
      pkmn.ingredient30.filter((ing) => ing.ingredient.name !== ingredient.LOCKED_INGREDIENT.name)[0],
      pkmn.ingredient60.filter((ing) => ing.ingredient.name !== ingredient.LOCKED_INGREDIENT.name)[0]
    ];
    const pokemonWithIngredients: PokemonWithIngredients = { pokemon: pkmn, ingredientList: AAA };

    const isSupportSkillMon = hasSpecialty(pkmn, 'skill') && INGREDIENT_SUPPORT_MAINSKILLS_SET.has(pkmn.skill.name);
    const optimalSettings: Optimal = isSupportSkillMon
      ? Optimal.skill(pkmn, 4, pkmn.skill.maxLevel)
      : Optimal.ingredient(pkmn, 4, pkmn.skill.maxLevel);
    const settings = Optimal.toMemberSettings({
      stats: optimalSettings,
      level,
      externalId: pkmn.name,
      sneakySnacking: false // for cooking, sneaky snacking is always worse
    });

    // TODO: this should probably be moved to member-state constructor
    settings.carrySize = CarrySizeUtils.calculateCarrySize({
      baseWithEvolutions: settings.carrySize,
      subskillsLevelLimited: settings.subskills,
      ribbon: settings.ribbon,
      camp
    });

    pokedexAsMembers.push({ settings, pokemonWithIngredients });
  }
  return pokedexAsMembers;
}

export function calculateNonSupportPokemon(params: {
  nonSupportMembers: TeamMember[];
  userMembers: TeamMember[];
  settings: TeamSettings;
  userRecipes: UserRecipes;
}): SimpleTeamResult[] {
  const { nonSupportMembers, userMembers, settings, userRecipes } = params;

  if (settings.includeCooking) {
    const [tastyChanceMembers, otherNonSupportMembersWithCookingMembers] = splitArrayByCondition(
      nonSupportMembers,
      (member) => member.pokemonWithIngredients.pokemon.skill.is(TastyChanceS)
    );
    const [cookingPowerUpMembers, otherNonSupportMembers] = splitArrayByCondition(
      otherNonSupportMembersWithCookingMembers,
      (member) => member.pokemonWithIngredients.pokemon.skill.is(CookingPowerUpS)
    );
    const otherNonSupportProductionStats = calculateSimple({
      settings: { ...settings, includeCooking: false },
      members: [...userMembers, ...otherNonSupportMembers],
      userRecipes
    });

    // TODO: duplicated code for tasty chance and cooking power up, refactor
    const tastyChanceMembersProductionStats: SimpleTeamResult[] = [];
    for (let i = 0; i < tastyChanceMembers.length; ++i) {
      const tastyChanceMember = tastyChanceMembers[i];

      const tastyChanceTeamResults = calculateSimple({
        settings,
        members: [...userMembers, tastyChanceMember],
        userRecipes
      });
      const tastyChanceMemberResult = tastyChanceTeamResults.find(
        (member) => member.member.settings.externalId === tastyChanceMember.settings.externalId
      );
      if (!tastyChanceMemberResult) {
        throw new ProgrammingError('Tasty chance member was somehow not included in the team results');
      }

      tastyChanceMembersProductionStats.push(tastyChanceMemberResult);
    }
    const cookingPowerUpMembersProductionStats: SimpleTeamResult[] = [];
    for (let i = 0; i < cookingPowerUpMembers.length; ++i) {
      const cookingPowerUpMember = cookingPowerUpMembers[i];

      const cookingPowerUpTeamResults = calculateSimple({
        settings,
        members: [...userMembers, cookingPowerUpMember],
        userRecipes
      });
      const cookingPowerUpMemberResult = cookingPowerUpTeamResults.find(
        (member) => member.member.settings.externalId === cookingPowerUpMember.settings.externalId
      );
      if (!cookingPowerUpMemberResult) {
        throw new ProgrammingError('Tasty chance member was somehow not included in the team results');
      }

      cookingPowerUpMembersProductionStats.push(cookingPowerUpMemberResult);
    }

    return [
      ...tastyChanceMembersProductionStats,
      ...cookingPowerUpMembersProductionStats,
      ...otherNonSupportProductionStats
    ];
  } else {
    return calculateSimple({
      settings: { ...settings, includeCooking: false },
      members: [...userMembers, ...nonSupportMembers],
      userRecipes
    });
  }
}

export function calculateSupportPokemon(params: {
  supportMembers: TeamMember[];
  userMembers: TeamMember[];
  settings: TeamSettings;
  userRecipes: UserRecipes;
}): SimpleTeamResult[] {
  const { supportMembers, userMembers, settings, userRecipes } = params;

  const supportProductionStats: SimpleTeamResult[] = [];
  for (let i = 0; i < supportMembers.length; ++i) {
    const supportMember = supportMembers[i];
    const emptyTeamSpace = MAX_TEAM_SIZE - (userMembers.length + 1); // user mons + the support member we're calculating
    const simpleResults = calculateSimple({
      settings: { ...settings, includeCooking: false },
      members: [...userMembers, supportMember, ...bogusMembers(emptyTeamSpace)],
      userRecipes
    });
    const simpleResult = simpleResults.find(
      (result) =>
        result.member.pokemonWithIngredients.pokemon.name === supportMember.pokemonWithIngredients.pokemon.name
    );
    simpleResult && supportProductionStats.push(simpleResult);
  }
  return supportProductionStats;
}

// TEST skill ingredients and produced ingredients are divided for per meal window
// TEST skill ingredients are added to the total ingredients
// TEST every ing list is calculated for every input simpleResult
export function convertAAAToAllIngredientSets(
  // TODO: this type is weird, only needed to combine SimpleResults and TeamResults, maybe there is better way
  aaaResults: {
    pokemon: Pokemon;
    averageHelps: number;
    skillIngredients: IngredientIndexToFloatAmount;
    critMultiplier: number;
    averageWeekdayPotSize: number;
    settings: TeamMemberSettings;
  }[]
): SetCoverPokemonSetupWithSettings[] {
  const result: SetCoverPokemonSetupWithSettings[] = [];
  for (const aaaResult of aaaResults) {
    const pokemon = aaaResult.pokemon;
    const helpsPerMealWindow = aaaResult.averageHelps / MEALS_IN_DAY;
    const skillIngredientsPerMealWindow = aaaResult.skillIngredients._mutateUnary((ing) => ing / MEALS_IN_DAY);

    for (const ingredientList of getAllIngredientLists(pokemon, aaaResult.settings.level)) {
      const memberWithIngList: TeamMember = {
        pokemonWithIngredients: { pokemon, ingredientList },
        settings: aaaResult.settings
      };
      const averageProduce = TeamSimulatorUtils.calculateAverageProduce(memberWithIngList);
      const totalIngredientsFloat = averageProduce.ingredients
        ._mutateUnary((ing) => ing * helpsPerMealWindow)
        ._mutateCombine(skillIngredientsPerMealWindow, (a, b) => a + b);
      result.push({
        pokemonSet: { pokemon: pokemon.name, ingredients: ingredientSetToIntFlat(ingredientList) },
        totalIngredients: convertFloat32ToInt16(totalIngredientsFloat),
        ingredientList,
        averageHelps: aaaResult.averageHelps,
        skillIngredients: aaaResult.skillIngredients,
        critMultiplier: aaaResult.critMultiplier,
        averageWeekdayPotSize: aaaResult.averageWeekdayPotSize,
        totalIngredientsFloat,
        settings: settingsToArraySubskills(aaaResult.settings)
      });
    }
  }
  return result;
}

export function groupProducersByIngredient(producers: SetCoverPokemonSetupWithSettings[]): Array<Array<number>> {
  const ingredientProducers: IngredientProducers = producers.map((producer) => ({
    pokemonSet: producer.pokemonSet,
    totalIngredients: producer.totalIngredients
  }));

  const producersByIngredientIndex: Array<Array<number>> = Array.from(
    { length: ingredient.TOTAL_NUMBER_OF_INGREDIENTS },
    () => []
  );
  for (let ingredientIndex = 0; ingredientIndex < ingredient.TOTAL_NUMBER_OF_INGREDIENTS; ++ingredientIndex) {
    const producersOfIngredientIndex: number[] = [];
    for (let producerIndex = 0; producerIndex < ingredientProducers.length; ++producerIndex) {
      if (ingredientProducers[producerIndex].totalIngredients[ingredientIndex] > 0) {
        producersOfIngredientIndex.push(producerIndex);
      }
    }

    producersOfIngredientIndex.sort(
      (a, b) =>
        ingredientProducers[b].totalIngredients[ingredientIndex] -
        ingredientProducers[a].totalIngredients[ingredientIndex]
    );

    producersByIngredientIndex[ingredientIndex] = producersOfIngredientIndex;
  }

  return producersByIngredientIndex;
}

export function pokemonProductionToRecipeSolutions(
  production: SetCoverPokemonSetupWithSettings[]
): SolveRecipeSolutionWithSettings {
  const combinedProduction = combineProduction(production);

  return {
    members: production,
    producedIngredients: combinedProduction
  };
}

export function createSettingsLookupTable(
  pokemonWithSettings: SetCoverPokemonSetupWithSettings[]
): Map<string, SetCoverPokemonSetupWithSettings> {
  const map: Map<string, SetCoverPokemonSetupWithSettings> = new Map();
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

export function bogusMembers(nrOfMembers: number): TeamMember[] {
  const bogusMember: TeamMember = mocks.teamMember();
  return new Array(nrOfMembers).fill(bogusMember);
}

export function hashPokemonSetIndexed(pokemonSet: PokemonWithIngredientsIndexed) {
  const ingredientsHash = Array.from(pokemonSet.ingredients).join(',');
  return `${pokemonSet.pokemon}:${ingredientsHash}`;
}

export function enrichSolutions(
  result: SolveRecipeResult,
  settingsCache: Map<string, SetCoverPokemonSetupWithSettings>
): SolveRecipeResultWithSettings {
  const enrichedTeams: SolveRecipeSolutionWithSettings[] = [];
  for (const team of result.teams) {
    const enrichedMembers: IngredientProducersWithSettings = [];
    for (const member of team.members) {
      const settings = settingsCache.get(hashPokemonSetIndexed(member.pokemonSet));
      if (!settings) {
        throw new ProgrammingError(
          `Settings cached didn't contain settings for ${hashPokemonSetIndexed(member.pokemonSet)}`
        );
      }

      enrichedMembers.push({
        pokemonSet: member.pokemonSet,
        totalIngredients: member.totalIngredients,
        ingredientList: settings.ingredientList,
        critMultiplier: settings.critMultiplier,
        averageWeekdayPotSize: settings.averageWeekdayPotSize,
        averageHelps: settings.averageHelps,
        skillIngredients: settings.skillIngredients,
        totalIngredientsFloat: settings.totalIngredientsFloat,
        settings: { ...settings.settings, subskills: [...settings.settings.subskills] }
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
