/* eslint-disable @typescript-eslint/no-explicit-any */
import { TeamMemberDAO } from '@src/database/dao/team/team-member-dao';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture';
import { uuid } from 'sleepapi-common';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

beforeEach(() => {
  uuid.v4 = jest.fn().mockReturnValue('0'.repeat(36));
});

describe('TeamMemberDAO insert', () => {
  it('shall insert new entity', async () => {
    const teamMember = await TeamMemberDAO.insert({
      fk_team_id: 1,
      fk_pokemon_id: 1,
      member_index: 0,
    });
    expect(teamMember).toBeDefined();

    const data = await TeamMemberDAO.findMultiple();
    expect(data).toMatchInlineSnapshot(`
      [
        {
          "fk_pokemon_id": 1,
          "fk_team_id": 1,
          "id": 1,
          "member_index": 0,
          "version": 1,
        },
      ]
    `);
  });

  it('shall fail to insert entity without fk_team_id', async () => {
    await expect(
      TeamMemberDAO.insert({
        fk_team_id: undefined as any,
        fk_pokemon_id: 1,
        member_index: 0,
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: team_member.fk_team_id/);
  });

  it('shall fail to insert entity without fk_pokemon_id', async () => {
    await expect(
      TeamMemberDAO.insert({
        fk_team_id: 1,
        fk_pokemon_id: undefined as any,
        member_index: 0,
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: team_member.fk_pokemon_id/);
  });

  it('shall fail to insert entity without member_index', async () => {
    await expect(
      TeamMemberDAO.insert({
        fk_team_id: 1,
        fk_pokemon_id: 1,
        member_index: undefined as any,
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: team_member.member_index/);
  });

  it('shall fail to insert entity with duplicate fk_team_id and member_index', async () => {
    await TeamMemberDAO.insert({
      fk_team_id: 1,
      fk_pokemon_id: 1,
      member_index: 0,
    });
    await expect(
      TeamMemberDAO.insert({
        fk_team_id: 1,
        fk_pokemon_id: 2,
        member_index: 0,
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: UNIQUE constraint failed: team_member.fk_team_id, team_member.member_index/);
  });
});

describe('TeamMemberDAO update', () => {
  it('shall update entity', async () => {
    const teamMember = await TeamMemberDAO.insert({
      fk_team_id: 1,
      fk_pokemon_id: 1,
      member_index: 0,
    });
    expect(teamMember.fk_pokemon_id).toEqual(1);

    await TeamMemberDAO.update({ ...teamMember, fk_pokemon_id: 2 });

    const data = await TeamMemberDAO.findMultiple();
    expect(data).toMatchInlineSnapshot(`
      [
        {
          "fk_pokemon_id": 2,
          "fk_team_id": 1,
          "id": 1,
          "member_index": 0,
          "version": 2,
        },
      ]
    `);
  });

  it('shall fail to update entity with duplicate fk_team_id and member_index', async () => {
    await TeamMemberDAO.insert({
      fk_team_id: 1,
      fk_pokemon_id: 1,
      member_index: 0,
    });
    const teamMemberB = await TeamMemberDAO.insert({
      fk_team_id: 1,
      fk_pokemon_id: 2,
      member_index: 1,
    });

    await expect(TeamMemberDAO.update({ ...teamMemberB, member_index: 0 })).rejects.toThrow(
      /SQLITE_CONSTRAINT: UNIQUE constraint failed: team_member.fk_team_id, team_member.member_index/
    );
  });
});

describe('TeamMemberDAO delete', () => {
  it('shall delete entity', async () => {
    const teamMember = await TeamMemberDAO.insert({
      fk_team_id: 1,
      fk_pokemon_id: 1,
      member_index: 0,
    });

    await TeamMemberDAO.delete({ id: teamMember.id });

    const data = await TeamMemberDAO.findMultiple();
    expect(data).toEqual([]);
  });
});
