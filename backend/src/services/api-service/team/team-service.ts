import { DBPokemon, PokemonDAO } from '@src/database/dao/pokemon/pokemon-dao';
import { DBTeamWithoutVersion, TeamDAO } from '@src/database/dao/team/team-dao';
import { TeamMemberDAO } from '@src/database/dao/team/team-member-dao';
import { DBUser } from '@src/database/dao/user/user-dao';
import { IngredientError } from '@src/domain/error/ingredient/ingredient-error';
import {
  GetTeamsResponse,
  IngredientTemplate,
  SubskillTemplate,
  UpsertTeamMemberRequest,
  UpsertTeamMemberResponse,
  UpsertTeamMetaResponse,
  uuid,
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
    version: upsertedTeam.version,
  };
}

// TODO: would be better if this entire thing was in a transaction
export async function upsertTeamMember(params: {
  teamIndex: number;
  request: UpsertTeamMemberRequest;
  user: DBUser;
}): Promise<UpsertTeamMemberResponse> {
  const { teamIndex, request, user } = params;

  const team = await TeamDAO.find({ fk_user_id: user.id, team_index: teamIndex });
  const updatedTeam = await TeamDAO.upsert({
    updated: {
      fk_user_id: user.id,
      team_index: teamIndex,
      camp: team?.camp ?? false,
      name: team?.name ?? `Helper team ${teamIndex + 1}`,
    },
    filter: { fk_user_id: user.id, team_index: teamIndex },
  });

  const memberExternalId = request.externalId ?? uuid.v4();
  // TODO: this will always update the mon even if no changes, which will bump version, which will cause resims
  // TODO: this will happen for "duplicate" function in frontend and "add from saved"
  const upsertedMember = await PokemonDAO.upsert({
    updated: {
      external_id: memberExternalId,
      fk_user_id: user.id,
      saved: request.saved,
      pokemon: request.pokemon,
      name: request.name,
      level: request.level,
      carry_size: request.carrySize,
      skill_level: request.skillLevel,
      nature: request.nature,
      subskill_10: subskillForLevel(10, request.subskills),
      subskill_25: subskillForLevel(25, request.subskills),
      subskill_50: subskillForLevel(50, request.subskills),
      subskill_75: subskillForLevel(75, request.subskills),
      subskill_100: subskillForLevel(100, request.subskills),
      ingredient_0: ingredientForLevel(0, request.ingredients),
      ingredient_30: ingredientForLevel(30, request.ingredients),
      ingredient_60: ingredientForLevel(60, request.ingredients),
    },
    filter: { external_id: memberExternalId },
  });

  const updatedMemberMeta = await TeamMemberDAO.upsert({
    updated: { fk_pokemon_id: upsertedMember.id, fk_team_id: updatedTeam.id, member_index: request.index },
    filter: { fk_team_id: updatedTeam.id, member_index: request.index },
  });

  return {
    index: updatedMemberMeta.member_index,
    externalId: upsertedMember.external_id,
    version: upsertedMember.version,
    saved: upsertedMember.saved,
    pokemon: upsertedMember.pokemon,
    name: upsertedMember.name,
    level: upsertedMember.level,
    carrySize: upsertedMember.carry_size,
    skillLevel: upsertedMember.skill_level,
    nature: upsertedMember.nature,
    subskills: filterFilledSubskills(upsertedMember),
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

function subskillForLevel(level: number, subskills: SubskillTemplate[]) {
  return subskills.find((subskill) => subskill.level === level)?.subskill;
}

function filterFilledSubskills(subskills: DBPokemon): SubskillTemplate[] {
  const filledSubskills: SubskillTemplate[] = [];

  if (subskills.subskill_10) {
    filledSubskills.push({ level: 10, subskill: subskills.subskill_10 });
  }
  if (subskills.subskill_25) {
    filledSubskills.push({ level: 25, subskill: subskills.subskill_25 });
  }
  if (subskills.subskill_50) {
    filledSubskills.push({ level: 50, subskill: subskills.subskill_50 });
  }
  if (subskills.subskill_75) {
    filledSubskills.push({ level: 75, subskill: subskills.subskill_75 });
  }
  if (subskills.subskill_100) {
    filledSubskills.push({ level: 100, subskill: subskills.subskill_100 });
  }

  return filledSubskills;
}

function ingredientForLevel(level: number, ingredients: IngredientTemplate[]) {
  const ingredient = ingredients.find((ingredient) => ingredient.level === level)?.ingredient;
  if (!ingredient) {
    throw new IngredientError('Missing required ingredient in upsert member request for level: ' + level);
  }
  return ingredient;
}

export async function getTeams(user: DBUser): Promise<GetTeamsResponse> {
  const teams = await TeamDAO.findTeamsWithMembers(user.id);

  return {
    teams,
  };
}
