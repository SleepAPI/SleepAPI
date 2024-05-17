/* eslint-disable @typescript-eslint/no-explicit-any */
import { TokenDAO } from '@src/database/dao/user/token-dao';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture';
import { MockService } from '@src/utils/test-utils/mock-service';
import { getMySQLNow } from '@src/utils/time-utils/time-utils';
import { uuid } from 'sleepapi-common';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

jest.mock('@src/utils/time-utils/time-utils', () => ({
  ...jest.requireActual('@src/utils/time-utils/time-utils'),
  getMySQLNow: jest.fn().mockReturnValue('2024-01-01 18:00:00'),
}));

beforeEach(() => {
  uuid.v4 = jest.fn().mockReturnValue('0'.repeat(36));
});

afterEach(() => {
  MockService.restore();
});

describe('TokenDAO insert', () => {
  it('shall insert new entity', async () => {
    const token = await TokenDAO.insert({
      device_id: 'some-device-id',
      refresh_token: 'some-refresh-token',
      last_login: getMySQLNow(),
    });
    expect(token).toBeDefined();

    const data = await TokenDAO.findMultiple();
    expect(data).toMatchInlineSnapshot(`
      [
        {
          "device_id": "some-device-id",
          "id": 1,
          "last_login": "2024-01-01 18:00:00",
          "refresh_token": "some-refresh-token",
        },
      ]
    `);
  });

  it('shall fail to insert entity without refresh_token', async () => {
    await expect(
      TokenDAO.insert({
        device_id: 'some-device-id',
        refresh_token: undefined as any,
        last_login: getMySQLNow(),
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: token.refresh_token/);
  });

  it('shall fail to insert entity without device_id', async () => {
    await expect(
      TokenDAO.insert({
        device_id: undefined as any,
        refresh_token: 'some-refresh-token',
        last_login: getMySQLNow(),
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: token.device_id/);
  });

  it('shall fail to insert entity with refresh_token that already exists', async () => {
    await TokenDAO.insert({
      device_id: 'device1',
      refresh_token: 'token1',
      last_login: getMySQLNow(),
    });
    await expect(
      TokenDAO.insert({
        device_id: 'device2',
        refresh_token: 'token1',
        last_login: getMySQLNow(),
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: UNIQUE constraint failed: token.refresh_token/);
  });
});

describe('TokenDAO update', () => {
  it('shall update entity', async () => {
    const token = await TokenDAO.insert({
      device_id: 'device1',
      refresh_token: 'token1',
      last_login: getMySQLNow(),
    });
    expect(token.last_login).toEqual('2024-01-01 18:00:00');

    await TokenDAO.update({ ...token, last_login: '2024-02-02 18:00:00' });

    const data = await TokenDAO.findMultiple();
    expect(data).toMatchInlineSnapshot(`
      [
        {
          "device_id": "device1",
          "id": 1,
          "last_login": "2024-02-02 18:00:00",
          "refresh_token": "token1",
        },
      ]
    `);
  });
});
