import { DBUser } from '@src/database/dao/user/user-dao';
import {
  deletePokemon,
  deleteUser,
  getSavedPokemon,
  upsertPokemon,
} from '@src/services/api-service/login/login-service';
import { PokemonInstanceWithMeta } from 'sleepapi-common';

export default class UserController {
  public async deleteUser(user: DBUser) {
    return deleteUser(user);
  }

  public async getUserPokemon(user: DBUser) {
    return getSavedPokemon(user);
  }

  public async upsertPokemon(params: { user: DBUser; pokemonInstance: PokemonInstanceWithMeta }) {
    return upsertPokemon(params);
  }

  public async deletePokemon(params: { user: DBUser; externalId: string }) {
    return deletePokemon(params);
  }
}
