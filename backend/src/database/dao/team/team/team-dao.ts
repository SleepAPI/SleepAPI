import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithVersionedIdSchema } from '@src/database/dao/abstract-dao.js';
import type { DBPokemon } from '@src/database/dao/pokemon/pokemon-dao.js';
import { PokemonDAO } from '@src/database/dao/pokemon/pokemon-dao.js';
import { TeamAreaDAO } from '@src/database/dao/team/team-area/team-area-dao.js';
import { TeamMemberDAO } from '@src/database/dao/team/team-member/team-member-dao.js';
import { UserAreaDAO } from '@src/database/dao/user/user-area/user-area-dao.js';
import {
  CarrySizeUtils,
  getPokemon,
  type BerrySetSimple,
  type GetTeamResponse,
  type IngredientSetSimple,
  type MemberInstance,
  type SubskillInstanceDto
} from 'sleepapi-common';

const DBTeamSchema = Type.Composite([
  DBWithVersionedIdSchema,
  Type.Object({
    fk_user_id: Type.Number(),
    fk_team_area_id: Type.Number(),
    team_index: Type.Number(),
    name: Type.String(),
    camp: Type.Boolean(),
    bedtime: Type.String(),
    wakeup: Type.String(),
    recipe_type: Type.Union([Type.Literal('curry'), Type.Literal('salad'), Type.Literal('dessert')]),
    stockpiled_ingredients: Type.Optional(Type.String()),
    stockpiled_berries: Type.Optional(Type.String())
  })
]);
export type DBTeam = Static<typeof DBTeamSchema>;
export type DBTeamWithoutVersion = Omit<DBTeam, 'id' | 'version'>;

class TeamDAOImpl extends AbstractDAO<typeof DBTeamSchema> {
  public tableName = 'team';
  public schema = DBTeamSchema;

  public async findTeamsWithMembers(userId: number): Promise<GetTeamResponse[]> {
    // TODO: change to join instead of doing 2 additional gets for each team
    const teams = await this.findMultiple({ fk_user_id: userId });

    const teamsWithMembers: GetTeamResponse[] = [];
    for (const team of teams) {
      const members: MemberInstance[] = [];
      const memberMetaData = await TeamMemberDAO.findMultiple({ fk_team_id: team.id });
      for (const memberData of memberMetaData) {
        const member: DBPokemon = await PokemonDAO.get({ id: memberData.fk_pokemon_id });

        const subskills: SubskillInstanceDto[] = [];
        if (member.subskill_10) {
          subskills.push({ level: 10, subskill: member.subskill_10 });
        }
        if (member.subskill_25) {
          subskills.push({ level: 25, subskill: member.subskill_25 });
        }
        if (member.subskill_50) {
          subskills.push({ level: 50, subskill: member.subskill_50 });
        }
        if (member.subskill_70) {
          subskills.push({ level: 70, subskill: member.subskill_70 });
        }
        if (member.subskill_80) {
          subskills.push({ level: 80, subskill: member.subskill_80 });
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
          carrySize: CarrySizeUtils.baseCarrySize(getPokemon(member.pokemon)),
          skillLevel: member.skill_level,
          nature: member.nature,
          subskills,
          sneakySnacking: memberData.sneaky_snacking,
          ingredients: PokemonDAO.filterChosenIngredientList(member)
        });
      }

      const teamArea = await TeamAreaDAO.get({ id: team.fk_team_area_id });
      const userArea = await UserAreaDAO.get({ id: teamArea.fk_user_area_id });

      teamsWithMembers.push({
        index: team.team_index,
        name: team.name,
        camp: team.camp,
        bedtime: team.bedtime,
        wakeup: team.wakeup,
        recipeType: team.recipe_type,
        island: {
          islandName: userArea.area,
          favoredBerries: teamArea.favored_berries,
          expertModifier: teamArea.expert_modifier,
          mainFavoriteBerry: teamArea.main_favorite_berry,
          subFavoriteBerries: teamArea.sub_favorite_berries
        },
        stockpiledBerries: this.stringToStockpile(team.stockpiled_berries, true),
        stockpiledIngredients: this.stringToStockpile(team.stockpiled_ingredients, false),
        version: team.version,
        members
      });
    }
    return teamsWithMembers;
  }

  public stockpileToString(stockpile?: { name: string; amount: number; level?: number }[]) {
    return stockpile
      ?.map(({ name, amount, level }) => `${name}:${amount}${level !== undefined ? `:${level}` : ''}`)
      .join(',');
  }

  public stringToStockpile(stockpileStr?: string, isBerry?: true): BerrySetSimple[] | undefined;
  public stringToStockpile(stockpileStr?: string, isBerry?: false): IngredientSetSimple[] | undefined;
  public stringToStockpile(
    stockpileStr?: string,
    isBerry?: boolean
  ): { name: string; amount: number; level?: number }[] | undefined {
    if (!stockpileStr) return undefined;

    return stockpileStr.split(',').map((entry) => {
      const [name, amount, level] = entry.split(':');
      const base = { name, amount: Number(amount) };

      return isBerry ? { ...base, level: Number(level) } : base;
    });
  }
}

export const TeamDAO = new TeamDAOImpl();
