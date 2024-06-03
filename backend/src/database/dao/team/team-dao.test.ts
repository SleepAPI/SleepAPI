/* eslint-disable @typescript-eslint/no-explicit-any */
import { PokemonDAO } from '@src/database/dao/pokemon/pokemon-dao';
import { TeamDAO } from '@src/database/dao/team/team-dao';
import { TeamMemberDAO } from '@src/database/dao/team/team-member-dao';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture';
import { uuid } from 'sleepapi-common';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

beforeEach(() => {
  uuid.v4 = jest.fn().mockReturnValue('0'.repeat(36));
});

describe('TeamDAO insert', () => {
  it('shall insert new entity', async () => {
    const team = await TeamDAO.insert({
      fk_user_id: 1,
      team_index: 0,
      name: 'Team A',
      camp: false,
    });
    expect(team).toBeDefined();

    const data = await TeamDAO.findMultiple();
    expect(data).toMatchInlineSnapshot(`
      [
        {
          "camp": false,
          "fk_user_id": 1,
          "id": 1,
          "name": "Team A",
          "team_index": 0,
          "version": 1,
        },
      ]
    `);
  });

  it('shall fail to insert entity without fk_user_id', async () => {
    await expect(
      TeamDAO.insert({
        fk_user_id: undefined as any,
        team_index: 0,
        name: 'Team A',
        camp: false,
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: team.fk_user_id/);
  });

  it('shall fail to insert entity without team_index', async () => {
    await expect(
      TeamDAO.insert({
        fk_user_id: 1,
        team_index: undefined as any,
        name: 'Team A',
        camp: false,
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: team.team_index/);
  });

  it('shall fail to insert entity without name', async () => {
    await expect(
      TeamDAO.insert({
        fk_user_id: 1,
        team_index: 0,
        name: undefined as any,
        camp: false,
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: team.name/);
  });

  it('shall fail to insert entity with duplicate fk_user_id and team_index', async () => {
    await TeamDAO.insert({
      fk_user_id: 1,
      team_index: 0,
      name: 'Team A',
      camp: false,
    });
    await expect(
      TeamDAO.insert({
        fk_user_id: 1,
        team_index: 0,
        name: 'Team B',
        camp: true,
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: UNIQUE constraint failed: team.fk_user_id, team.team_index/);
  });
});

describe('TeamDAO update', () => {
  it('shall update entity', async () => {
    const team = await TeamDAO.insert({
      fk_user_id: 1,
      team_index: 0,
      name: 'Team A',
      camp: false,
    });
    expect(team.name).toEqual('Team A');

    await TeamDAO.update({ ...team, name: 'Updated Team A' });

    const data = await TeamDAO.findMultiple();
    expect(data).toMatchInlineSnapshot(`
      [
        {
          "camp": false,
          "fk_user_id": 1,
          "id": 1,
          "name": "Updated Team A",
          "team_index": 0,
          "version": 2,
        },
      ]
    `);
  });

  it('shall fail to update entity with duplicate fk_user_id and team_index', async () => {
    await TeamDAO.insert({
      fk_user_id: 1,
      team_index: 0,
      name: 'Team A',
      camp: false,
    });
    const teamB = await TeamDAO.insert({
      fk_user_id: 1,
      team_index: 1,
      name: 'Team B',
      camp: true,
    });

    await expect(TeamDAO.update({ ...teamB, team_index: 0 })).rejects.toThrow(
      /SQLITE_CONSTRAINT: UNIQUE constraint failed: team.fk_user_id, team.team_index/
    );
  });
});

describe('TeamDAO delete', () => {
  it('shall delete entity', async () => {
    const team = await TeamDAO.insert({
      fk_user_id: 1,
      team_index: 0,
      name: 'Team A',
      camp: false,
    });

    await TeamDAO.delete({ id: team.id });

    const data = await TeamDAO.findMultiple();
    expect(data).toEqual([]);
  });
});

describe('findTeamsWithMembers', () => {
  it('shall get team with members', async () => {
    await TeamDAO.insert({
      fk_user_id: 1,
      team_index: 0,
      name: 'Team A',
      camp: false,
    });
    // should not be found
    await TeamDAO.insert({
      fk_user_id: 2,
      team_index: 0,
      name: 'Team B',
      camp: false,
    });

    await PokemonDAO.insert({
      fk_user_id: 1,
      saved: true,
      pokemon: 'Pikachu',
      name: 'Sparky',
      skill_level: 5,
      carry_size: 10,
      level: 25,
      nature: 'Brave',
      subskill_10: 'Thunderbolt',
      subskill_25: 'Quick Attack',
      subskill_50: 'Iron Tail',
      subskill_75: 'Electro Ball',
      subskill_100: 'Thunder',
      ingredient_0: 'Berry',
      ingredient_30: 'Potion',
      ingredient_60: 'Elixir',
    });

    await PokemonDAO.insert({
      fk_user_id: 1,
      saved: true,
      pokemon: 'Bulbasaur',
      name: 'Bubble',
      skill_level: 5,
      carry_size: 10,
      level: 25,
      nature: 'Brave',
      subskill_10: 'Thunderbolt',
      subskill_25: 'Quick Attack',
      subskill_50: 'Iron Tail',
      subskill_75: 'Electro Ball',
      subskill_100: 'Thunder',
      ingredient_0: 'Berry',
      ingredient_30: 'Potion',
      ingredient_60: 'Elixir',
    });

    // should not be included, is saved to user, but not included in team
    await PokemonDAO.insert({
      fk_user_id: 1,
      saved: true,
      pokemon: 'Bulbasaur',
      name: 'Bubble',
      skill_level: 5,
      carry_size: 10,
      level: 25,
      nature: 'Brave',
      subskill_10: 'Thunderbolt',
      subskill_25: 'Quick Attack',
      subskill_50: 'Iron Tail',
      subskill_75: 'Electro Ball',
      subskill_100: 'Thunder',
      ingredient_0: 'Berry',
      ingredient_30: 'Potion',
      ingredient_60: 'Elixir',
    });

    // Team: [pika, pika, bulba]
    await TeamMemberDAO.insert({
      member_index: 0,
      fk_team_id: 1,
      fk_pokemon_id: 1,
    });
    await TeamMemberDAO.insert({
      member_index: 1,
      fk_team_id: 1,
      fk_pokemon_id: 1,
    });
    await TeamMemberDAO.insert({
      member_index: 2,
      fk_team_id: 1,
      fk_pokemon_id: 2,
    });

    expect(await TeamDAO.findTeamsWithMembers(1)).toMatchSnapshot();
  });
});
