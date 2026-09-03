/* eslint-disable @typescript-eslint/no-explicit-any */
import { PokemonDAO } from '@src/database/dao/pokemon/pokemon-dao.js';
import { TeamAreaDAO } from '@src/database/dao/team/team-area/team-area-dao.js';
import { TeamMemberDAO } from '@src/database/dao/team/team-member/team-member-dao.js';
import { TeamDAO } from '@src/database/dao/team/team/team-dao.js';
import { UserAreaDAO } from '@src/database/dao/user/user-area/user-area-dao.js';
import { UserDAO } from '@src/database/dao/user/user/user-dao.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { mocks } from '@src/vitest/index.js';
import { getPokemon, uuid } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true, enforceForeignKeyConstraints: true });

let teamAreaId: number;
let userAreaId: number;

beforeEach(async () => {
  let innerCounter = 0;
  vimic(uuid, 'v4', () => `${++innerCounter}`.padEnd(36, `${innerCounter}`));

  // Create test users
  await UserDAO.insert(mocks.dbUser({ friend_code: 'AAAAAA', external_id: '1' }));
  await UserDAO.insert(mocks.dbUser({ friend_code: 'BBBBBB', external_id: '2' }));

  // Create user area
  const userArea = await UserAreaDAO.insert({
    fk_user_id: 1,
    area: 'greengrass',
    bonus: 1.5
  });
  userAreaId = userArea.id;

  // Create team area
  const teamArea = await TeamAreaDAO.insert({ fk_user_area_id: userAreaId, favored_berries: '' });
  teamAreaId = teamArea.id;
});

describe('TeamDAO insert', () => {
  it('shall insert new entity', async () => {
    const team = await TeamDAO.insert({
      fk_user_id: 1,
      fk_team_area_id: teamAreaId,
      team_index: 0,
      name: 'Team A',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry'
    });
    expect(team).toBeDefined();

    const data = await TeamDAO.findMultiple();
    expect(data).toMatchInlineSnapshot(`
      [
        {
          "bedtime": "21:30",
          "camp": false,
          "fk_team_area_id": 1,
          "fk_user_id": 1,
          "id": 1,
          "meal_plan": undefined,
          "name": "Team A",
          "recipe_type": "curry",
          "stockpiled_berries": undefined,
          "stockpiled_ingredients": undefined,
          "team_index": 0,
          "version": 1,
          "wakeup": "06:00",
        },
      ]
    `);
  });

  it('shall fail to insert entity without fk_user_id', async () => {
    await expect(
      TeamDAO.insert({
        fk_team_area_id: teamAreaId,
        fk_user_id: undefined as any,
        team_index: 0,
        name: 'Team A',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipe_type: 'curry'
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: team.fk_user_id/);
  });

  it('shall fail to insert entity without team_index', async () => {
    await expect(
      TeamDAO.insert({
        fk_team_area_id: teamAreaId,
        fk_user_id: 1,
        team_index: undefined as any,
        name: 'Team A',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipe_type: 'curry'
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: team.team_index/);
  });

  it('shall fail to insert entity without name', async () => {
    await expect(
      TeamDAO.insert({
        fk_team_area_id: teamAreaId,
        fk_user_id: 1,
        team_index: 0,
        name: undefined as any,
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipe_type: 'curry'
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: team.name/);
  });

  it('shall fail to insert entity with duplicate fk_user_id and team_index', async () => {
    await TeamDAO.insert({
      fk_team_area_id: teamAreaId,
      fk_user_id: 1,
      team_index: 0,
      name: 'Team A',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry'
    });
    const secondTeamArea = await TeamAreaDAO.insert({ fk_user_area_id: userAreaId, favored_berries: '' });
    await expect(
      TeamDAO.insert({
        fk_team_area_id: secondTeamArea.id,
        fk_user_id: 1,
        team_index: 0,
        name: 'Team B',
        camp: true,
        bedtime: '21:30',
        wakeup: '06:00',
        recipe_type: 'curry'
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: UNIQUE constraint failed: team.fk_user_id, team.team_index/);
  });
});

describe('TeamDAO update', () => {
  it('shall update entity', async () => {
    const team = await TeamDAO.insert({
      fk_team_area_id: teamAreaId,
      fk_user_id: 1,
      team_index: 0,
      name: 'Team A',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry'
    });
    expect(team.name).toEqual('Team A');

    await TeamDAO.update({ ...team, name: 'Updated Team A' });

    const data = await TeamDAO.findMultiple();
    expect(data).toMatchInlineSnapshot(`
      [
        {
          "bedtime": "21:30",
          "camp": false,
          "fk_team_area_id": 1,
          "fk_user_id": 1,
          "id": 1,
          "meal_plan": undefined,
          "name": "Updated Team A",
          "recipe_type": "curry",
          "stockpiled_berries": undefined,
          "stockpiled_ingredients": undefined,
          "team_index": 0,
          "version": 2,
          "wakeup": "06:00",
        },
      ]
    `);
  });

  it('shall fail to update entity with duplicate fk_user_id and team_index', async () => {
    await TeamDAO.insert({
      fk_team_area_id: teamAreaId,
      fk_user_id: 1,
      team_index: 0,
      name: 'Team A',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry'
    });
    const secondTeamArea = await TeamAreaDAO.insert({ fk_user_area_id: userAreaId, favored_berries: '' });
    const teamB = await TeamDAO.insert({
      fk_team_area_id: secondTeamArea.id,
      fk_user_id: 1,
      team_index: 1,
      name: 'Team B',
      camp: true,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry'
    });

    await expect(TeamDAO.update({ ...teamB, team_index: 0 })).rejects.toThrow(
      /SQLITE_CONSTRAINT: UNIQUE constraint failed: team.fk_user_id, team.team_index/
    );
  });
});

describe('TeamDAO delete', () => {
  it('shall delete entity', async () => {
    const team = await TeamDAO.insert({
      fk_team_area_id: teamAreaId,
      fk_user_id: 1,
      team_index: 0,
      name: 'Team A',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry'
    });

    await TeamDAO.delete({ id: team.id });

    const data = await TeamDAO.findMultiple();
    expect(data).toEqual([]);
  });
});

describe('findTeamsWithMembers', () => {
  it('shall get team with members', async () => {
    await TeamDAO.insert({
      fk_team_area_id: teamAreaId,
      fk_user_id: 1,
      team_index: 0,
      name: 'Team A',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry'
    });
    // should not be found
    const secondUserArea = await UserAreaDAO.insert({
      fk_user_id: 2,
      area: 'cyan',
      bonus: 0
    });
    const secondTeamArea = await TeamAreaDAO.insert({ fk_user_area_id: secondUserArea.id, favored_berries: '' });
    await TeamDAO.insert({
      fk_team_area_id: secondTeamArea.id,
      fk_user_id: 2,
      team_index: 0,
      name: 'Team B',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry'
    });

    await PokemonDAO.insert({
      fk_user_id: 1,
      saved: true,
      shiny: false,
      external_id: uuid.v4(),
      pokemon: 'Pikachu',
      name: 'Sparky',
      skill_level: 5,
      carry_size: getPokemon('Pikachu').carrySize,
      level: 25,
      ribbon: 0,
      nature: 'Brave',
      subskill_10: 'Thunderbolt',
      subskill_25: 'Quick Attack',
      subskill_50: 'Iron Tail',
      subskill_70: 'Electro Ball',
      subskill_80: 'Thunder',
      ingredient_0: 'Berry',
      ingredient_30: 'Potion',
      ingredient_60: 'Elixir'
    });

    await PokemonDAO.insert({
      fk_user_id: 1,
      saved: true,
      shiny: false,
      external_id: uuid.v4(),
      pokemon: 'Bulbasaur',
      name: 'Bubble',
      skill_level: 5,
      carry_size: getPokemon('Bulbasaur').carrySize,
      level: 25,
      ribbon: 0,
      nature: 'Brave',
      subskill_10: 'Thunderbolt',
      subskill_25: 'Quick Attack',
      subskill_50: 'Iron Tail',
      subskill_70: 'Electro Ball',
      subskill_80: 'Thunder',
      ingredient_0: 'Berry',
      ingredient_30: 'Potion',
      ingredient_60: 'Elixir'
    });

    // should not be included, is saved to user, but not included in team
    await PokemonDAO.insert({
      fk_user_id: 1,
      saved: true,
      shiny: false,
      external_id: uuid.v4(),
      pokemon: 'Bulbasaur',
      name: 'Bubble',
      skill_level: 5,
      carry_size: getPokemon('Bulbasaur').carrySize,
      level: 25,
      ribbon: 0,
      nature: 'Brave',
      subskill_10: 'Thunderbolt',
      subskill_25: 'Quick Attack',
      subskill_50: 'Iron Tail',
      subskill_70: 'Electro Ball',
      subskill_80: 'Thunder',
      ingredient_0: 'Berry',
      ingredient_30: 'Potion',
      ingredient_60: 'Elixir'
    });

    // Team: [pika, pika, bulba]
    await TeamMemberDAO.insert({
      member_index: 0,
      fk_team_id: 1,
      fk_pokemon_id: 1,
      sneaky_snacking: false
    });
    await TeamMemberDAO.insert({
      member_index: 1,
      fk_team_id: 1,
      fk_pokemon_id: 1,
      sneaky_snacking: false
    });
    await TeamMemberDAO.insert({
      member_index: 2,
      fk_team_id: 1,
      fk_pokemon_id: 2,
      sneaky_snacking: false
    });

    expect(await TeamDAO.findTeamsWithMembers(1)).toMatchSnapshot();
  });
});

describe('stockpileToString', () => {
  it('shall convert stockpile to string', () => {
    const stockpile = [
      { name: 'Berry', amount: 10, level: 1 },
      { name: 'Potion', amount: 5 }
    ];
    const result = TeamDAO.stockpileToString(stockpile);
    expect(result).toEqual('Berry:10:1,Potion:5');
  });

  it('shall return undefined for empty stockpile', () => {
    const result = TeamDAO.stockpileToString();
    expect(result).toBeUndefined();
  });
});

describe('stringToStockpile', () => {
  it('shall convert string to berry stockpile', () => {
    const stockpileStr = 'Berry:10:1,Potion:5:2';
    const result = TeamDAO.stringToStockpile(stockpileStr, true);
    expect(result).toEqual([
      { name: 'Berry', amount: 10, level: 1 },
      { name: 'Potion', amount: 5, level: 2 }
    ]);
  });

  it('shall convert string to ingredient stockpile', () => {
    const stockpileStr = 'Berry:10,Potion:5';
    const result = TeamDAO.stringToStockpile(stockpileStr, false);
    expect(result).toEqual([
      { name: 'Berry', amount: 10 },
      { name: 'Potion', amount: 5 }
    ]);
  });

  it('shall return undefined for empty string', () => {
    const result = TeamDAO.stringToStockpile('');
    expect(result).toBeUndefined();
  });
});
