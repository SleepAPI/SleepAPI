import { config } from '@src/config/config';
import { PokemonDAO } from '@src/database/dao/pokemon/pokemon-dao';
import { TeamMemberDAO } from '@src/database/dao/team/team-member-dao';
import { DBUser, UserDAO } from '@src/database/dao/user/user-dao';
import { AuthorizationError } from '@src/domain/error/api/api-error';
import { OAuth2Client, TokenInfo } from 'google-auth-library';
import { LoginResponse, PokemonInstanceWithMeta, RefreshResponse, uuid } from 'sleepapi-common';

interface DecodedUserData {
  sub: string;
  email: string;
  given_name: string;
  picture: string;
}

export const client = new OAuth2Client({
  clientId: config.GOOGLE_CLIENT_ID,
  clientSecret: config.GOOGLE_CLIENT_SECRET,
  redirectUri: 'postmessage',
});

export async function signup(authorization_code: string): Promise<LoginResponse> {
  const { tokens } = await client.getToken({
    code: authorization_code,
    redirect_uri: 'postmessage',
  });

  if (!tokens.refresh_token || !tokens.access_token || !tokens.expiry_date) {
    throw new AuthorizationError(`Missing data in google getToken response. Response: [${JSON.stringify(tokens)}]`);
  }

  client.setCredentials({ access_token: tokens.access_token });

  const userinfo = await client.request<DecodedUserData>({
    url: 'https://www.googleapis.com/oauth2/v3/userinfo',
  });

  const existingUser =
    (await UserDAO.find({ sub: userinfo.data.sub })) ??
    (await UserDAO.insert({ sub: userinfo.data.sub, external_id: uuid.v4(), name: 'New user' }));

  return {
    name: existingUser.name,
    avatar: existingUser.avatar,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
  };
}

export async function refresh(refresh_token: string): Promise<RefreshResponse> {
  client.setCredentials({ refresh_token });

  const { token } = await client.getAccessToken();
  const { expiry_date } = client.credentials;

  if (!token || !expiry_date) {
    throw new AuthorizationError('Failed to refresh access token');
  }

  return {
    access_token: token,
    expiry_date,
  };
}

export async function verify(access_token: string) {
  client.setCredentials({ access_token });
  const response = await client.request<TokenInfo>({
    url: `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${access_token}`,
  });
  const tokenInfo = response.data;

  if (tokenInfo.aud !== config.GOOGLE_CLIENT_ID) {
    throw new AuthorizationError('Token was not issued from this server');
  }

  return UserDAO.get({ sub: tokenInfo.sub });
}

export async function deleteUser(user: DBUser) {
  UserDAO.delete(user);
}

export async function getSavedPokemon(user: DBUser): Promise<PokemonInstanceWithMeta[]> {
  const userPokemon = await PokemonDAO.findMultiple({ fk_user_id: user.id, saved: true });

  return userPokemon.map((pkmn) => ({
    externalId: pkmn.external_id,
    version: pkmn.version,
    saved: pkmn.saved,
    shiny: pkmn.shiny,
    gender: pkmn.gender,
    pokemon: pkmn.pokemon,
    name: pkmn.name,
    level: pkmn.level,
    ribbon: pkmn.ribbon,
    carrySize: pkmn.carry_size,
    skillLevel: pkmn.skill_level,
    nature: pkmn.nature,
    subskills: PokemonDAO.filterFilledSubskills(pkmn),
    ingredients: [
      {
        level: 0,
        ingredient: pkmn.ingredient_0,
      },
      {
        level: 30,
        ingredient: pkmn.ingredient_30,
      },
      {
        level: 60,
        ingredient: pkmn.ingredient_60,
      },
    ],
  }));
}

export async function upsertPokemon(params: { user: DBUser; pokemonInstance: PokemonInstanceWithMeta }) {
  const { user, pokemonInstance } = params;

  const upsertedPokemon = await PokemonDAO.upsert({
    updated: {
      external_id: pokemonInstance.externalId,
      fk_user_id: user.id,
      saved: pokemonInstance.saved,
      shiny: pokemonInstance.shiny,
      gender: pokemonInstance.gender,
      pokemon: pokemonInstance.pokemon,
      name: pokemonInstance.name,
      level: pokemonInstance.level,
      ribbon: pokemonInstance.ribbon,
      carry_size: pokemonInstance.carrySize,
      skill_level: pokemonInstance.skillLevel,
      nature: pokemonInstance.nature,
      subskill_10: PokemonDAO.subskillForLevel(10, pokemonInstance.subskills),
      subskill_25: PokemonDAO.subskillForLevel(25, pokemonInstance.subskills),
      subskill_50: PokemonDAO.subskillForLevel(50, pokemonInstance.subskills),
      subskill_75: PokemonDAO.subskillForLevel(75, pokemonInstance.subskills),
      subskill_100: PokemonDAO.subskillForLevel(100, pokemonInstance.subskills),
      ingredient_0: PokemonDAO.ingredientForLevel(0, pokemonInstance.ingredients),
      ingredient_30: PokemonDAO.ingredientForLevel(30, pokemonInstance.ingredients),
      ingredient_60: PokemonDAO.ingredientForLevel(60, pokemonInstance.ingredients),
    },
    filter: { external_id: pokemonInstance.externalId },
  });

  // if not saved, check if any teams use it, if not delete
  // we upsert first above always since we need to get the id anyway
  if (!pokemonInstance.saved) {
    const usedInTeams = await TeamMemberDAO.findMultiple({ fk_pokemon_id: upsertedPokemon.id });
    if (usedInTeams.length === 0) {
      await PokemonDAO.delete(upsertedPokemon);
    }
  }
}

export async function deletePokemon(params: { user: DBUser; externalId: string }) {
  const { user, externalId } = params;

  PokemonDAO.delete({ fk_user_id: user.id, external_id: externalId });
}
