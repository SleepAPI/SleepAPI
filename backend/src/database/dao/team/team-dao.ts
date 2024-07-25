import { Static, Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithVersionedIdSchema } from '@src/database/dao/abstract-dao';
import { DBPokemon, PokemonDAO } from '@src/database/dao/pokemon/pokemon-dao';
import { TeamMemberDAO } from '@src/database/dao/team/team-member-dao';
import { GetTeamResponse, MemberInstance, SubskillInstance } from 'sleepapi-common';

const DBTeamSchema = Type.Composite([
  DBWithVersionedIdSchema,
  Type.Object({
    fk_user_id: Type.Number(),
    team_index: Type.Number(),
    name: Type.String(),
    camp: Type.Boolean(),
    bedtime: Type.String(),
    wakeup: Type.String(),
  }),
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
              ingredient: member.ingredient_0,
            },
            {
              level: 30,
              ingredient: member.ingredient_30,
            },
            {
              level: 60,
              ingredient: member.ingredient_60,
            },
          ],
        });
      }

      teamsWithMembers.push({
        index: team.team_index,
        name: team.name,
        camp: team.camp,
        bedtime: team.bedtime,
        wakeup: team.wakeup,
        version: team.version,
        members,
      });
    }
    return teamsWithMembers;
  }

  // TODO: if we get heavy load on server we can do it on db, but needs some boolean processing and more love
  // public async getTeamsWithPokemon(userId: number): Promise<GetTeamResponse[]> {
  //   const knex = await DatabaseService.getKnex();

  //   const rows = await knex
  //     .select([
  //       'team.id as team_id',
  //       'team.version as team_version',
  //       'team.team_index',
  //       'team.name as team_name',
  //       'team.camp',
  //       'team_member.id as member_id',
  //       'team_member.member_index',
  //       'pokemon.id as pokemon_id',
  //       'pokemon.saved',
  //       'pokemon.pokemon',
  //       'pokemon.name as pokemon_name',
  //       'pokemon.level',
  //       'pokemon.carry_size',
  //       'pokemon.skill_level',
  //       'pokemon.nature',
  //       'pokemon.subskill_10',
  //       'pokemon.subskill_25',
  //       'pokemon.subskill_50',
  //       'pokemon.subskill_75',
  //       'pokemon.subskill_100',
  //       'pokemon.ingredient_0',
  //       'pokemon.ingredient_30',
  //       'pokemon.ingredient_60',
  //     ])
  //     .from('team')
  //     .leftJoin('team_member', 'team.id', 'team_member.fk_team_id')
  //     .leftJoin('pokemon', 'team_member.fk_pokemon_id', 'pokemon.id')
  //     .where('team.fk_user_id', userId)
  //     .orderBy(['team.team_index', 'team_member.member_index']);

  //   const teamsMap: Record<number, GetTeamResponse> = {};

  //   for (const row of rows) {
  //     if (!teamsMap[row.team_id]) {
  //       teamsMap[row.team_id] = {
  //         index: row.team_index,
  //         name: row.team_name,
  //         camp: row.camp,
  //         version: row.team_version,
  //         members: [],
  //       };
  //     }

  //     if (row.pokemon_id !== null) {
  //       const subskills: InstancedSubskill[] = [];
  //       if (row.subskill_10) {
  //         subskills.push({ level: 10, subskill: row.subskill_10 });
  //       }
  //       if (row.subskill_25) {
  //         subskills.push({ level: 25, subskill: row.subskill_25 });
  //       }
  //       if (row.subskill_50) {
  //         subskills.push({ level: 50, subskill: row.subskill_50 });
  //       }
  //       if (row.subskill_75) {
  //         subskills.push({ level: 75, subskill: row.subskill_75 });
  //       }
  //       if (row.subskill_100) {
  //         subskills.push({ level: 100, subskill: row.subskill_100 });
  //       }

  //       teamsMap[row.team_id].members[row.member_index] = {
  //         index: row.member_index,
  //         saved: row.saved,
  //         pokemon: row.pokemon,
  //         name: row.pokemon_name,
  //         level: row.level,
  //         carrySize: row.carry_size,
  //         skillLevel: row.skill_level,
  //         nature: row.nature,
  //         subskills,
  //         ingredients: [
  //           {
  //             level: 0,
  //             ingredient: row.ingredient_0,
  //           },
  //           {
  //             level: 30,
  //             ingredient: row.ingredient_30,
  //           },
  //           {
  //             level: 60,
  //             ingredient: row.ingredient_60,
  //           },
  //         ],
  //       };
  //     }
  //   }

  //   return Object.values(teamsMap);
  // }
}

export const TeamDAO = new TeamDAOImpl();
