/* eslint-disable @typescript-eslint/no-explicit-any */
import { TeamDAO } from '@src/database/dao/team/team-dao';
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
