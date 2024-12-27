import { config } from '@src/config/config.js';
import { PokemonDAO } from '@src/database/dao/pokemon/pokemon-dao.js';
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { AuthorizationError } from '@src/domain/error/api/api-error.js';
import {
  client,
  deletePokemon,
  deleteUser,
  getSavedPokemon,
  refresh,
  signup,
  upsertPokemon,
  verify
} from '@src/services/api-service/login/login-service.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import { describe, expect, it } from 'bun:test';
import { boozle } from 'bunboozle';
import type { PokemonInstanceWithMeta } from 'sleepapi-common';
import { uuid } from 'sleepapi-common';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

boozle(TimeUtils, 'getMySQLNow', () => '2024-01-01 18:00:00');
boozle(uuid, 'v4', () => '0'.repeat(36));
boozle(global.logger, 'info');

describe('signup', () => {
  it('should call google API with correct credentials', async () => {
    boozle(client, 'getToken', () => ({
      tokens: {
        refresh_token: 'some-refresh-token',
        access_token: 'some-access-token',
        expiry_date: 10
      }
    }));

    boozle(client, 'setCredentials', () => ({}));
    boozle(client, 'request', () => ({
      data: {
        sub: 'some-sub',
        email: 'some-email'
      }
    }));

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
  "email": "some-email",
  "expiry_date": 10,
  "externalId": "000000000000000000000000000000000000",
  "name": "New user",
  "refresh_token": "some-refresh-token",
}
`);
    expect(client.getToken).toHaveBeenCalledWith({ code: 'some-auth-code', redirect_uri: 'postmessage' });
    expect(client.setCredentials).toHaveBeenCalledWith({ access_token: 'some-access-token' });
  });

  it('should throw an error if google response is missing tokens', async () => {
    boozle(client, 'getToken', () => ({
      tokens: {}
    }));

    expect(signup('some-auth-code')).rejects.toThrow(AuthorizationError);
  });

  it('should handle existing user correctly', async () => {
    boozle(client, 'getToken', () => ({
      tokens: {
        refresh_token: 'some-refresh-token',
        access_token: 'some-access-token',
        expiry_date: 10
      }
    }));
    boozle(client, 'setCredentials', () => ({}));
    boozle(client, 'request', () => ({
      data: {
        sub: 'some-sub',
        email: 'some-email'
      }
    }));

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
  "email": "some-email",
  "expiry_date": 10,
  "externalId": "000000000000000000000000000000000000",
  "name": "Existing user",
  "refresh_token": "some-refresh-token",
}
`);
  });
});

describe('refresh', () => {
  it('should refresh the access token successfully', async () => {
    client.credentials;
    boozle(client, 'setCredentials');
    boozle(client, 'getAccessToken', () => ({ token: 'new-access-token' }));
    boozle(client, 'credentials', {
      expiry_date: 10
    });

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
    boozle(client, 'setCredentials');
    boozle(client, 'credentials', { expiry_date: 0 });
    boozle(client, 'getAccessToken', () => ({ token: null }));

    expect(refresh('some-refresh-token')).rejects.toThrow('Failed to refresh access token');
  });
});

describe('verify', () => {
  it('should verify the access token and return the correct user', async () => {
    const accessToken = 'valid-access-token';
    const userInfo = {
      sub: 'some-sub',
      aud: config.GOOGLE_CLIENT_ID
    };

    boozle(client, 'setCredentials');
    boozle(client, 'request', () => ({ data: userInfo }));
    await UserDAO.insert({
      external_id: uuid.v4(),
      name: 'Existing user',
      sub: 'some-sub'
    });

    const user = await verify(accessToken);

    expect(user).toMatchInlineSnapshot(`
{
  "avatar": undefined,
  "external_id": "000000000000000000000000000000000000",
  "id": 1,
  "name": "Existing user",
  "sub": "some-sub",
  "version": 1,
}
`);

    expect(client.setCredentials).toHaveBeenCalledWith({ access_token: accessToken });
    expect(client.request).toHaveBeenCalledWith({
      url: `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`
    });
  });

  it('should throw an error if token info does not match the expected client ID', async () => {
    const accessToken = 'invalid-access-token';
    const userInfo = {
      sub: 'some-sub',
      aud: 'wrong-client-id'
    };

    boozle(client, 'setCredentials');
    boozle(client, 'request', () => ({
      data: userInfo
    }));

    expect(verify(accessToken)).rejects.toThrow('Token was not issued from this server');
  });

  it('should handle Google API request failure', async () => {
    const accessToken = 'valid-access-token';

    boozle(client, 'setCredentials');
    boozle(client, 'request', () => {
      throw new Error('Google API request failed');
    });

    expect(verify(accessToken)).rejects.toThrow('Google API request failed');
  });

  it('should throw an error if user is not found in the database', async () => {
    const accessToken = 'valid-access-token';
    const userInfo = {
      sub: 'some-sub',
      aud: config.GOOGLE_CLIENT_ID
    };

    boozle(client, 'setCredentials');
    boozle(client, 'request', () => ({ data: userInfo }));

    expect(verify(accessToken)).rejects.toThrowErrorMatchingInlineSnapshot(
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

describe('getSavedPokemon', () => {
  it("shall return a user's saved pokemon", async () => {
    const user = await UserDAO.insert({ sub: 'some-sub', external_id: uuid.v4(), name: 'Existing user' });
    const pkmnSaved = await PokemonDAO.insert({
      ...basePokemon,
      saved: true,
      external_id: 'saved id',
      fk_user_id: user.id
    });
    await PokemonDAO.insert({ ...basePokemon, saved: false, external_id: 'not saved id', fk_user_id: user.id });

    expect((await getSavedPokemon(user)).map((pkmn) => pkmn.externalId)).toEqual([pkmnSaved.external_id]);
  });
});

describe('upsertPokemon', () => {
  const pokemonInstance: PokemonInstanceWithMeta = {
    carrySize: 0,
    externalId: 'ext id',
    ingredients: [
      { level: 0, ingredient: 'ing0' },
      { level: 30, ingredient: 'ing30' },
      { level: 60, ingredient: 'ing60' }
    ],
    level: 0,
    name: 'name',
    nature: 'nature',
    pokemon: 'pokemon',
    ribbon: 0,
    saved: false,
    shiny: false,
    gender: 'female',
    skillLevel: 0,
    subskills: [],
    version: 0
  };
  it('shall insert pokemon if not exists and saved is true', async () => {
    const user = await UserDAO.insert({ sub: 'some-sub', external_id: uuid.v4(), name: 'Existing user' });

    await upsertPokemon({ user, pokemonInstance: { ...pokemonInstance, saved: true } });

    expect(await PokemonDAO.findMultiple()).toHaveLength(1);
  });

  it('shall update pokemon if pre-exists', async () => {
    const user = await UserDAO.insert({ sub: 'some-sub', external_id: uuid.v4(), name: 'Existing user' });

    await upsertPokemon({ user, pokemonInstance: { ...pokemonInstance, saved: true } });
    await upsertPokemon({ user, pokemonInstance: { ...pokemonInstance, saved: true } });

    const pkmns = await PokemonDAO.findMultiple();
    expect(pkmns).toHaveLength(1);
    expect(pkmns[0].version).toBe(2); // it updated
  });

  it('shall delete pokemon if saved false and does not exist in any teams', async () => {
    const user = await UserDAO.insert({ sub: 'some-sub', external_id: uuid.v4(), name: 'Existing user' });

    await upsertPokemon({ user, pokemonInstance: { ...pokemonInstance, saved: false } });

    expect(await PokemonDAO.findMultiple()).toHaveLength(0);
  });
});

describe('deletePokemon', () => {
  it('shall delete specific pokemon for user', async () => {
    const user = await UserDAO.insert({ sub: 'some-sub', external_id: uuid.v4(), name: 'Existing user' });
    const pkmn = await PokemonDAO.insert({
      ...basePokemon,
      saved: true,
      external_id: 'saved id',
      fk_user_id: user.id
    });

    expect(await PokemonDAO.findMultiple()).toHaveLength(1);

    await deletePokemon({ user, externalId: pkmn.external_id });

    expect(await PokemonDAO.findMultiple()).toHaveLength(0);
  });

  it('shall not delete if user id matches, but external id doesnt', async () => {
    const user = await UserDAO.insert({ sub: 'some-sub', external_id: uuid.v4(), name: 'Existing user' });
    await PokemonDAO.insert({
      ...basePokemon,
      saved: true,
      external_id: 'saved id',
      fk_user_id: user.id
    });

    expect(await PokemonDAO.findMultiple()).toHaveLength(1);

    await deletePokemon({ user, externalId: 'incorrect' });

    expect(await PokemonDAO.findMultiple()).toHaveLength(1);
  });
});

const basePokemon = {
  shiny: false,
  pokemon: 'Pikachu',
  name: 'Sparky',
  skill_level: 5,
  carry_size: 10,
  level: 25,
  ribbon: 0,
  nature: 'Brave',
  subskill_10: 'Thunderbolt',
  subskill_25: 'Quick Attack',
  subskill_50: 'Iron Tail',
  subskill_75: 'Electro Ball',
  subskill_100: 'Thunder',
  ingredient_0: 'Berry',
  ingredient_30: 'Potion',
  ingredient_60: 'Elixir'
};
