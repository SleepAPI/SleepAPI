import { PokemonDAO } from '@src/database/dao/pokemon/pokemon-dao';
import { DBTeamWithoutVersion, TeamDAO } from '@src/database/dao/team/team-dao';
import { TeamMemberDAO } from '@src/database/dao/team/team-member-dao';
import { DBUser } from '@src/database/dao/user/user-dao';
import {
  GetTeamsResponse,
  UpsertTeamMemberRequest,
  UpsertTeamMemberResponse,
  UpsertTeamMetaResponse,
} from 'sleepapi-common';

export async function upsertTeamMeta(team: DBTeamWithoutVersion): Promise<UpsertTeamMetaResponse> {
  const upsertedTeam = await TeamDAO.upsert({
    updated: team,
    filter: { fk_user_id: team.fk_user_id, team_index: team.team_index },
  });
  return {
    index: upsertedTeam.team_index,
    name: upsertedTeam.name,
    camp: upsertedTeam.camp,
    bedtime: upsertedTeam.bedtime,
    wakeup: upsertedTeam.wakeup,
    recipeType: upsertedTeam.recipe_type,
    favoredBerries: upsertedTeam.favored_berries?.split(','),
    version: upsertedTeam.version,
  };
}

export async function deleteTeam(index: number, user: DBUser) {
  const team = await TeamDAO.get({ fk_user_id: user.id, team_index: index });
  const teamMembers = await TeamMemberDAO.findMultiple({ fk_team_id: team.id });

  for (const teamMember of teamMembers) {
    const pkmn = await PokemonDAO.get({ id: teamMember.fk_pokemon_id });
    if (!pkmn.saved) {
      await PokemonDAO.delete(pkmn);
    }
  }

  await TeamDAO.delete(team);
}

// TODO: would be better if this entire thing was in a transaction
export async function upsertTeamMember(params: {
  teamIndex: number;
  memberIndex: number;
  request: UpsertTeamMemberRequest;
  user: DBUser;
}): Promise<UpsertTeamMemberResponse> {
  const { teamIndex, memberIndex, request, user } = params;

  const team = await TeamDAO.find({ fk_user_id: user.id, team_index: teamIndex });
  const updatedTeam = await TeamDAO.upsert({
    updated: {
      fk_user_id: user.id,
      team_index: teamIndex,
      camp: team?.camp ?? false,
      bedtime: team?.bedtime ?? '21:30',
      wakeup: team?.wakeup ?? '06:00',
      recipe_type: team?.recipe_type ?? 'curry',
      favored_berries: team?.favored_berries,
      name: team?.name ?? `Helper team ${teamIndex + 1}`,
    },
    filter: { fk_user_id: user.id, team_index: teamIndex },
  });

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
      carry_size: request.carrySize,
      skill_level: request.skillLevel,
      nature: request.nature,
      subskill_10: PokemonDAO.subskillForLevel(10, request.subskills),
      subskill_25: PokemonDAO.subskillForLevel(25, request.subskills),
      subskill_50: PokemonDAO.subskillForLevel(50, request.subskills),
      subskill_75: PokemonDAO.subskillForLevel(75, request.subskills),
      subskill_100: PokemonDAO.subskillForLevel(100, request.subskills),
      ingredient_0: PokemonDAO.ingredientForLevel(0, request.ingredients),
      ingredient_30: PokemonDAO.ingredientForLevel(30, request.ingredients),
      ingredient_60: PokemonDAO.ingredientForLevel(60, request.ingredients),
    },
    filter: { external_id: request.externalId },
  });

  const updatedMemberMeta = await TeamMemberDAO.upsert({
    updated: { fk_pokemon_id: upsertedMember.id, fk_team_id: updatedTeam.id, member_index: memberIndex },
    filter: { fk_team_id: updatedTeam.id, member_index: memberIndex },
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
    carrySize: upsertedMember.carry_size,
    skillLevel: upsertedMember.skill_level,
    nature: upsertedMember.nature,
    subskills: PokemonDAO.filterFilledSubskills(upsertedMember),
    ingredients: [
      {
        level: 0,
        ingredient: upsertedMember.ingredient_0,
      },
      {
        level: 30,
        ingredient: upsertedMember.ingredient_30,
      },
      {
        level: 60,
        ingredient: upsertedMember.ingredient_60,
      },
    ],
  };
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
