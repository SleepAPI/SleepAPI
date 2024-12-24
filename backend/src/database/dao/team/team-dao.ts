import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithVersionedIdSchema } from '@src/database/dao/abstract-dao';
import type { DBPokemon } from '@src/database/dao/pokemon/pokemon-dao';
import { PokemonDAO } from '@src/database/dao/pokemon/pokemon-dao';
import { TeamMemberDAO } from '@src/database/dao/team/team-member-dao';
import type { GetTeamResponse, MemberInstance, SubskillInstance } from 'sleepapi-common';

const DBTeamSchema = Type.Composite([
  DBWithVersionedIdSchema,
  Type.Object({
    fk_user_id: Type.Number(),
    team_index: Type.Number(),
    name: Type.String(),
    camp: Type.Boolean(),
    bedtime: Type.String(),
    wakeup: Type.String(),
    recipe_type: Type.Union([Type.Literal('curry'), Type.Literal('salad'), Type.Literal('dessert')]),
    favored_berries: Type.Optional(Type.String())
  })
]);
export type DBTeam = Static<typeof DBTeamSchema>;
export type DBTeamWithoutVersion = Omit<DBTeam, 'id' | 'version'>;

class TeamDAOImpl extends AbstractDAO<typeof DBTeamSchema> {
  public tableName = 'team';
  public schema = DBTeamSchema;

  public async findTeamsWithMembers(userId: number) {
    const teams = await this.findMultiple({ fk_user_id: userId });

    const teamsWithMembers: GetTeamResponse[] = [];
    for (const team of teams) {
      const members: MemberInstance[] = [];
      const memberMetaData = await TeamMemberDAO.findMultiple({ fk_team_id: team.id });
      for (const memberData of memberMetaData) {
        const member: DBPokemon = await PokemonDAO.get({ id: memberData.fk_pokemon_id });

        const subskills: SubskillInstance[] = [];
        if (member.subskill_10) {
          subskills.push({ level: 10, subskill: member.subskill_10 });
        }
        if (member.subskill_25) {
          subskills.push({ level: 25, subskill: member.subskill_25 });
        }
        if (member.subskill_50) {
          subskills.push({ level: 50, subskill: member.subskill_50 });
        }
        if (member.subskill_75) {
          subskills.push({ level: 75, subskill: member.subskill_75 });
        }
        if (member.subskill_100) {
          subskills.push({ level: 100, subskill: member.subskill_100 });
        }

        members.push({
          memberIndex: memberData.member_index,
          version: member.version,
          saved: member.saved,
          shiny: member.shiny,
          gender: member.gender,
          externalId: member.external_id,
          pokemon: member.pokemon,
          name: member.name,
          level: member.level,
          ribbon: member.ribbon,
          carrySize: member.carry_size,
          skillLevel: member.skill_level,
          nature: member.nature,
          subskills,
          ingredients: [
            {
              level: 0,
              ingredient: member.ingredient_0
            },
            {
              level: 30,
              ingredient: member.ingredient_30
            },
            {
              level: 60,
              ingredient: member.ingredient_60
            }
          ]
        });
      }

      teamsWithMembers.push({
        index: team.team_index,
        name: team.name,
        camp: team.camp,
        bedtime: team.bedtime,
        wakeup: team.wakeup,
        recipeType: team.recipe_type,
        favoredBerries: team.favored_berries?.split(','),
        version: team.version,
        members
      });
    }
    return teamsWithMembers;
  }
}

export const TeamDAO = new TeamDAOImpl();
