import { PokemonDAO } from '@src/database/dao/pokemon/pokemon-dao.js';
import { TeamAreaDAO } from '@src/database/dao/team/team-area/team-area-dao.js';
import { TeamMemberDAO } from '@src/database/dao/team/team-member/team-member-dao.js';
import type { DBTeam, DBTeamWithoutVersion } from '@src/database/dao/team/team/team-dao.js';
import { TeamDAO } from '@src/database/dao/team/team/team-dao.js';
import { UserAreaDAO } from '@src/database/dao/user/user-area/user-area-dao.js';
import type { DBUser } from '@src/database/dao/user/user/user-dao.js';
import { DatabaseService } from '@src/database/database-service.js';
import type { Knex } from 'knex';
import type { IslandShortName, UpsertTeamMetaRequest } from 'sleepapi-common';
import {
  CarrySizeUtils,
  getPokemon,
  type GetTeamsResponse,
  type UpsertTeamMemberRequest,
  type UpsertTeamMemberResponse,
  type UpsertTeamMetaResponse
} from 'sleepapi-common';

export async function upsertTeamMeta(params: {
  index: number;
  request: UpsertTeamMetaRequest;
  user: DBUser;
}): Promise<UpsertTeamMetaResponse> {
  const { index, request, user } = params;

  const { islandName, favoredBerries, expertModifier, mainFavoriteBerry, subFavoriteBerries } = request.island;

  return DatabaseService.transaction(async (trx) => {
    const existingTeam = await TeamDAO.find({ fk_user_id: user.id, team_index: index }, { trx });

    // we need a user area in order to upsert team area
    const userArea = await findOrInsertUserArea({ islandName, userId: user.id, trx });

    const teamArea = await upsertTeamArea({
      favoredBerries: favoredBerries,
      expertModifier,
      mainFavoriteBerry,
      subFavoriteBerries,
      userAreaId: userArea.id,
      existingTeam,
      trx
    });

    const team: DBTeamWithoutVersion = {
      fk_user_id: user.id,
      fk_team_area_id: teamArea.id,
      team_index: index,
      name: request.name,
      camp: request.camp,
      bedtime: request.bedtime,
      wakeup: request.wakeup,
      recipe_type: request.recipeType,
      meal_plan: TeamDAO.mealPlanToString(request.mealPlan),
      stockpiled_ingredients: TeamDAO.stockpileToString(request.stockpiledIngredients),
      stockpiled_berries: TeamDAO.stockpileToString(request.stockpiledBerries)
    };

    const upsertedTeam = await TeamDAO.upsert({
      updated: team,
      filter: { fk_user_id: team.fk_user_id, team_index: team.team_index },
      options: { trx }
    });

    return {
      version: upsertedTeam.version
    };
  });
}

async function findOrInsertUserArea(params: { islandName: IslandShortName; userId: number; trx?: Knex.Transaction }) {
  const { islandName, userId, trx } = params;

  return await UserAreaDAO.findOrInsert({
    filter: { fk_user_id: userId, area: islandName },
    entityToInsert: {
      fk_user_id: userId,
      area: islandName,
      bonus: 0 // this will only insert if it doesn't exist
    },
    options: { trx }
  });
}

async function upsertTeamArea(params: {
  userAreaId: number;
  favoredBerries: string;
  expertModifier?: 'ingredient' | 'berry' | 'skill';
  mainFavoriteBerry?: string;
  subFavoriteBerries?: string;
  existingTeam?: DBTeam;
  trx?: Knex.Transaction;
}) {
  const { userAreaId, favoredBerries, expertModifier, mainFavoriteBerry, subFavoriteBerries, existingTeam, trx } =
    params;

  const teamAreaData = {
    fk_user_area_id: userAreaId,
    favored_berries: favoredBerries,
    expert_modifier: expertModifier,
    main_favorite_berry: mainFavoriteBerry,
    sub_favorite_berries: subFavoriteBerries
  };

  if (existingTeam) {
    return await TeamAreaDAO.upsert({
      filter: { id: existingTeam.fk_team_area_id },
      updated: teamAreaData,
      options: { trx }
    });
  } else {
    return await TeamAreaDAO.insert(teamAreaData, { trx });
  }
}

export async function deleteTeam(index: number, user: DBUser) {
  return DatabaseService.transaction(async (trx) => {
    const team = await TeamDAO.get({ fk_user_id: user.id, team_index: index }, { trx });
    const teamMembers = await TeamMemberDAO.findMultiple({ fk_team_id: team.id }, { trx });

    for (const teamMember of teamMembers) {
      const pkmn = await PokemonDAO.get({ id: teamMember.fk_pokemon_id }, { trx });
      if (!pkmn.saved) {
        await PokemonDAO.delete(pkmn, { trx });
      }
    }

    await TeamDAO.delete(team, { trx });
  });
}

export async function upsertTeamMember(params: {
  teamIndex: number;
  memberIndex: number;
  request: UpsertTeamMemberRequest;
  user: DBUser;
}): Promise<UpsertTeamMemberResponse> {
  const { teamIndex, memberIndex, request, user } = params;

  return DatabaseService.transaction(async (trx) => {
    const team = await TeamDAO.get({ fk_user_id: user.id, team_index: teamIndex }, { trx });

    // update team version to indicate that we've made changes to it, will trigger refresh on user's other devices
    await TeamDAO.update(team, { trx });

    const upsertedMember = await PokemonDAO.upsert({
      updated: {
        external_id: request.externalId,
        fk_user_id: user.id,
        saved: request.saved,
        shiny: request.shiny,
        gender: request.gender,
        pokemon: request.pokemon,
        name: request.name,
        level: request.level,
        ribbon: request.ribbon,
        carry_size: CarrySizeUtils.baseCarrySize(getPokemon(request.pokemon)),
        skill_level: request.skillLevel,
        nature: request.nature,
        subskill_10: PokemonDAO.subskillForLevel(10, request.subskills),
        subskill_25: PokemonDAO.subskillForLevel(25, request.subskills),
        subskill_50: PokemonDAO.subskillForLevel(50, request.subskills),
        subskill_70: PokemonDAO.subskillForLevel(70, request.subskills),
        subskill_80: PokemonDAO.subskillForLevel(80, request.subskills),
        ingredient_0: PokemonDAO.ingredientForLevel(0, request.ingredients),
        ingredient_30: PokemonDAO.ingredientForLevel(30, request.ingredients),
        ingredient_60: PokemonDAO.ingredientForLevel(60, request.ingredients)
      },
      filter: { external_id: request.externalId },
      options: { trx }
    });

    const updatedMemberMeta = await TeamMemberDAO.upsert({
      updated: {
        fk_pokemon_id: upsertedMember.id,
        fk_team_id: team.id,
        member_index: memberIndex,
        sneaky_snacking: request.sneakySnacking
      },
      filter: { fk_team_id: team.id, member_index: memberIndex },
      options: { trx }
    });

    return {
      memberIndex: updatedMemberMeta.member_index,
      externalId: upsertedMember.external_id,
      version: upsertedMember.version,
      saved: upsertedMember.saved,
      shiny: upsertedMember.shiny,
      gender: upsertedMember.gender,
      pokemon: upsertedMember.pokemon,
      name: upsertedMember.name,
      level: upsertedMember.level,
      ribbon: upsertedMember.ribbon,
      carrySize: CarrySizeUtils.baseCarrySize(getPokemon(upsertedMember.pokemon)),
      skillLevel: upsertedMember.skill_level,
      nature: upsertedMember.nature,
      subskills: request.subskills,
      ingredients: request.ingredients,
      sneakySnacking: request.sneakySnacking
    };
  });
}

export async function getTeams(user: DBUser): Promise<GetTeamsResponse> {
  const teams = await TeamDAO.findTeamsWithMembers(user.id);

  return { teams };
}

export async function deleteMember(params: { teamIndex: number; memberIndex: number; user: DBUser }) {
  const { teamIndex, memberIndex, user } = params;

  // update since we need to bump version too
  const teamToUpdate = await TeamDAO.get({ fk_user_id: user.id, team_index: teamIndex });
  const team = await TeamDAO.update(teamToUpdate);

  const teamMember = await TeamMemberDAO.get({ fk_team_id: team.id, member_index: memberIndex });
  await TeamMemberDAO.delete(teamMember);

  const pokemon = await PokemonDAO.get({ id: teamMember.fk_pokemon_id });
  const nrOfTimesInTeams = await TeamMemberDAO.count({ fk_pokemon_id: pokemon.id });
  // if pokemon not saved and this is the only time it is used in a team
  if (!pokemon.saved && nrOfTimesInTeams === 0) {
    await PokemonDAO.delete(pokemon);
  }
}
