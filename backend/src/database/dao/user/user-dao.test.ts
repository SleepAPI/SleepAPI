/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserDAO } from '@src/database/dao/user/user-dao';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture';
import { MockService } from '@src/utils/test-utils/mock-service';
import { uuid } from 'sleepapi-common';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

beforeEach(() => {
  uuid.v4 = jest.fn().mockReturnValue('0'.repeat(36));
});

afterEach(() => {
  MockService.restore();
});

describe('UserDAO insert', () => {
  it('shall insert new entity', async () => {
    const user = await UserDAO.insert({
      sub: 'some-sub',
      external_id: uuid.v4(),
      name: 'some-name',
    });
    expect(user).toBeDefined();

    const data = await UserDAO.findMultiple();
    expect(data).toMatchInlineSnapshot(`
      [
        {
          "avatar": undefined,
          "external_id": "000000000000000000000000000000000000",
          "id": 1,
          "name": "some-name",
          "sub": "some-sub",
        },
      ]
    `);
  });

  it('shall fail to insert entity without sub', async () => {
    await expect(
      UserDAO.insert({
        external_id: uuid.v4(),
        name: 'some-name',
        sub: undefined as any,
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: user.sub/);
  });

  it('shall fail to insert entity without external_id', async () => {
    await expect(
      UserDAO.insert({
        external_id: undefined as any,
        name: 'some-name',
        sub: 'some-sub',
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: user.external_id/);
  });

  it('shall fail to insert entity with sub that already exists', async () => {
    await UserDAO.insert({
      external_id: uuid.v4(),
      sub: 'sub1',
      name: 'some-name',
    });
    await expect(
      UserDAO.insert({
        external_id: uuid.v4(),
        sub: 'sub1',
        name: 'some-name',
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: UNIQUE constraint failed: user.external_id/);
  });
});

describe('UserDAO update', () => {
  it('shall update entity', async () => {
    const user = await UserDAO.insert({
      sub: 'some-sub',
      external_id: uuid.v4(),
      name: 'some-name',
    });
    expect(user.name).toEqual('some-name');

    await UserDAO.update({ ...user, name: 'updated-name' });

    const data = await UserDAO.findMultiple();
    expect(data).toMatchInlineSnapshot(`
      [
        {
          "avatar": undefined,
          "external_id": "000000000000000000000000000000000000",
          "id": 1,
          "name": "updated-name",
          "sub": "some-sub",
        },
      ]
    `);
  });
});
