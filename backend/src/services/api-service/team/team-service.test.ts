import { TeamDAO } from '@src/database/dao/team/team-dao';
import { DBUser, UserDAO } from '@src/database/dao/user/user-dao';
import { client } from '@src/services/api-service/login/login-service';
import { getTeams, upsertTeam } from '@src/services/api-service/team/team-service';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture';
import { MockService } from '@src/utils/test-utils/mock-service';
import { uuid } from 'sleepapi-common';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

beforeEach(() => {
  uuid.v4 = jest.fn().mockReturnValue('0'.repeat(36));
  MockService.init({ UserDAO, client });
});

afterEach(() => {
  MockService.restore();
});

describe('upsertTeam', () => {
  it('should create new team if team index does not previously exist', async () => {
    expect(await TeamDAO.findMultiple()).toEqual([]);

    await upsertTeam({ fk_user_id: 0, team_index: 0, name: 'some name', camp: false });

    expect(await TeamDAO.findMultiple()).toEqual([
      { camp: false, fk_user_id: 0, id: 1, name: 'some name', team_index: 0 },
    ]);
  });

  it('should update team if team index exists', async () => {
    await TeamDAO.insert({ name: 'old name', camp: false, fk_user_id: 0, team_index: 0 });
    await upsertTeam({ fk_user_id: 0, team_index: 0, name: 'new name', camp: false });

    expect(await TeamDAO.findMultiple()).toEqual([
      { camp: false, fk_user_id: 0, id: 1, name: 'new name', team_index: 0 },
    ]);
  });

  it('should insert new team for same owner if team_index not found', async () => {
    await TeamDAO.insert({ name: 'name', camp: false, fk_user_id: 0, team_index: 0 });
    await upsertTeam({ fk_user_id: 0, team_index: 1, name: 'name', camp: false });

    expect(await TeamDAO.findMultiple()).toEqual([
      { camp: false, fk_user_id: 0, id: 1, name: 'name', team_index: 0 },
      { camp: false, fk_user_id: 0, id: 2, name: 'name', team_index: 1 },
    ]);
  });
});

describe('getTeams', () => {
  it('should return an empty array if no teams exist for the user', async () => {
    const response = await getTeams({ id: 1, name: 'some name', sub: 'some sub', external_id: uuid.v4() });

    expect(response).toEqual({ teams: [] });
  });

  it('should return teams for the user if teams exist', async () => {
    const user: DBUser = { id: 1, name: 'some name', sub: 'some sub', external_id: uuid.v4() };
    await TeamDAO.insert({ fk_user_id: user.id, team_index: 0, name: 'Team A', camp: false });
    await TeamDAO.insert({ fk_user_id: user.id, team_index: 1, name: 'Team B', camp: true });

    const response = await getTeams(user);

    expect(response).toEqual({
      teams: [
        { index: 0, name: 'Team A', camp: false },
        { index: 1, name: 'Team B', camp: true },
      ],
    });
  });

  it('should only return teams belonging to the specified user', async () => {
    const user1: DBUser = { id: 1, name: 'user 1', sub: 'some sub', external_id: uuid.v4() };
    const user2: DBUser = { id: 2, name: 'user 2', sub: 'some sub', external_id: uuid.v4() };
    await TeamDAO.insert({ fk_user_id: user1.id, team_index: 0, name: 'Team A', camp: false });
    await TeamDAO.insert({ fk_user_id: user2.id, team_index: 1, name: 'Team B', camp: true });

    const response = await getTeams(user1);

    expect(response).toEqual({
      teams: [{ index: 0, name: 'Team A', camp: false }],
    });
  });
});
