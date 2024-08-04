import { config } from '@src/config/config';
import { UserDAO } from '@src/database/dao/user/user-dao';
import { AuthorizationError } from '@src/domain/error/api/api-error';
import { client, deleteUser, refresh, signup, verify } from '@src/services/api-service/login/login-service';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture';
import { MockService } from '@src/utils/test-utils/mock-service';
import { uuid } from 'sleepapi-common';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

jest.mock('@src/utils/time-utils/time-utils', () => ({
  ...jest.requireActual('@src/utils/time-utils/time-utils'),
  getMySQLNow: jest.fn().mockReturnValue('2024-01-01 18:00:00'),
}));

beforeEach(() => {
  uuid.v4 = jest.fn().mockReturnValue('0'.repeat(36));
  MockService.init({ UserDAO, client });
});

afterEach(() => {
  MockService.restore();
});

describe('signup', () => {
  it('should call google API with correct credentials', async () => {
    client.getToken = jest.fn().mockResolvedValue({
      tokens: {
        refresh_token: 'some-refresh-token',
        access_token: 'some-access-token',
        expiry_date: 10,
      },
    });

    client.setCredentials = jest.fn();
    client.request = jest.fn().mockResolvedValue({
      data: {
        sub: 'some-sub',
      },
    });

    const loginResponse = await signup('some-auth-code');

    expect(await UserDAO.findMultiple()).toMatchInlineSnapshot(`
      [
        {
          "avatar": undefined,
          "external_id": "000000000000000000000000000000000000",
          "id": 1,
          "name": "New user",
          "sub": "some-sub",
          "version": 1,
        },
      ]
    `);

    expect(loginResponse).toMatchInlineSnapshot(`
      {
        "access_token": "some-access-token",
        "avatar": undefined,
        "expiry_date": 10,
        "name": "New user",
        "refresh_token": "some-refresh-token",
      }
    `);
    expect(client.getToken).toHaveBeenCalledWith({ code: 'some-auth-code', redirect_uri: 'postmessage' });
    expect(client.setCredentials).toHaveBeenCalledWith({ access_token: 'some-access-token' });
  });

  it('should throw an error if google response is missing tokens', async () => {
    client.getToken = jest.fn().mockResolvedValue({
      tokens: {},
    });

    await expect(signup('some-auth-code')).rejects.toThrow(AuthorizationError);
  });

  it('should handle existing user correctly', async () => {
    client.getToken = jest.fn().mockResolvedValue({
      tokens: {
        refresh_token: 'some-refresh-token',
        access_token: 'some-access-token',
        expiry_date: 10,
      },
    });

    client.setCredentials = jest.fn();
    client.request = jest.fn().mockResolvedValue({
      data: {
        sub: 'some-sub',
      },
    });

    await UserDAO.insert({ sub: 'some-sub', external_id: uuid.v4(), name: 'Existing user' });

    const loginResponse = await signup('some-auth-code');

    expect(await UserDAO.findMultiple()).toMatchInlineSnapshot(`
      [
        {
          "avatar": undefined,
          "external_id": "000000000000000000000000000000000000",
          "id": 1,
          "name": "Existing user",
          "sub": "some-sub",
          "version": 1,
        },
      ]
    `);

    expect(loginResponse).toMatchInlineSnapshot(`
      {
        "access_token": "some-access-token",
        "avatar": undefined,
        "expiry_date": 10,
        "name": "Existing user",
        "refresh_token": "some-refresh-token",
      }
    `);
  });
});

describe('refresh', () => {
  it('should refresh the access token successfully', async () => {
    client.setCredentials = jest.fn();
    client.getAccessToken = jest.fn().mockResolvedValue({
      token: 'new-access-token',
    });
    client.credentials = {
      expiry_date: 10,
    };

    const refreshResponse = await refresh('some-refresh-token');

    expect(refreshResponse).toMatchInlineSnapshot(`
      {
        "access_token": "new-access-token",
        "expiry_date": 10,
      }
    `);

    expect(client.setCredentials).toHaveBeenCalledWith({ refresh_token: 'some-refresh-token' });
    expect(client.getAccessToken).toHaveBeenCalled();
  });

  it('should throw an error if Google API fails to provide a new access token', async () => {
    client.setCredentials = jest.fn();
    client.getAccessToken = jest.fn().mockResolvedValue({ token: null });
    client.credentials = {};

    await expect(refresh('some-refresh-token')).rejects.toThrow('Failed to refresh access token');
  });
});

describe('verify', () => {
  it('should verify the access token and return the correct user', async () => {
    const accessToken = 'valid-access-token';
    const userInfo = {
      sub: 'some-sub',
      aud: config.GOOGLE_CLIENT_ID,
    };

    client.setCredentials = jest.fn();
    client.request = jest.fn().mockResolvedValue({
      data: userInfo,
    });

    UserDAO.get = jest.fn().mockResolvedValue({
      external_id: uuid.v4(),
      id: 1,
      name: 'Existing user',
      sub: 'some-sub',
    });
    const user = await verify(accessToken);

    expect(user).toMatchInlineSnapshot(`
      {
        "external_id": "000000000000000000000000000000000000",
        "id": 1,
        "name": "Existing user",
        "sub": "some-sub",
      }
    `);

    expect(client.setCredentials).toHaveBeenCalledWith({ access_token: accessToken });
    expect(client.request).toHaveBeenCalledWith({
      url: `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`,
    });
    expect(UserDAO.get).toHaveBeenCalledWith({ sub: 'some-sub' });
  });

  it('should throw an error if token info does not match the expected client ID', async () => {
    const accessToken = 'invalid-access-token';
    const userInfo = {
      sub: 'some-sub',
      aud: 'wrong-client-id',
    };

    client.setCredentials = jest.fn();
    client.request = jest.fn().mockResolvedValue({
      data: userInfo,
    });

    await expect(verify(accessToken)).rejects.toThrow('Token was not issued from this server');
  });

  it('should handle Google API request failure', async () => {
    const accessToken = 'valid-access-token';

    client.setCredentials = jest.fn();
    client.request = jest.fn().mockRejectedValue(new Error('Google API request failed'));

    await expect(verify(accessToken)).rejects.toThrow('Google API request failed');
  });

  it('should throw an error if user is not found in the database', async () => {
    const accessToken = 'valid-access-token';
    const userInfo = {
      sub: 'some-sub',
      aud: config.GOOGLE_CLIENT_ID,
    };

    client.setCredentials = jest.fn();
    client.request = jest.fn().mockResolvedValue({
      data: userInfo,
    });

    await expect(verify(accessToken)).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Unable to find entry in user with filter [{"sub":"some-sub"}]"`
    );
  });
});

describe('delete', () => {
  it('should delete user from database', async () => {
    const user = await UserDAO.insert({ sub: 'some-sub', external_id: uuid.v4(), name: 'Existing user' });

    expect((await UserDAO.findMultiple()).map((user) => user.id)).toEqual([1]);
    await deleteUser(user);

    expect(await UserDAO.findMultiple()).toEqual([]);
  });
});
