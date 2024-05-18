import { config } from '@src/config/config';
import { UserDAO } from '@src/database/dao/user/user-dao';
import { AuthorizationError } from '@src/domain/error/api/api-error';
import { OAuth2Client, TokenInfo } from 'google-auth-library';
import { DecodedUserData, uuid } from 'sleepapi-common';

export const client = new OAuth2Client({
  clientId: config.GOOGLE_CLIENT_ID,
  clientSecret: config.GOOGLE_CLIENT_SECRET,
  redirectUri: 'postmessage',
});

export async function signup(authorization_code: string) {
  const { tokens } = await client.getToken({
    code: authorization_code,
    redirect_uri: 'postmessage',
  });

  if (!tokens.id_token || !tokens.refresh_token || !tokens.access_token || !tokens.expiry_date) {
    throw new AuthorizationError(`Missing data in google getToken response. Response: [${JSON.stringify(tokens)}]`);
  }

  client.setCredentials({ access_token: tokens.access_token });

  const userinfo = await client.request<DecodedUserData>({
    url: 'https://www.googleapis.com/oauth2/v3/userinfo',
  });

  const existingUser = await UserDAO.find({ sub: userinfo.data.sub });
  if (!existingUser) {
    await UserDAO.insert({ sub: userinfo.data.sub, external_id: uuid.v4(), name: 'New user' });
  }

  return {
    id_token: tokens.id_token,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
  };
}

export async function refresh(refresh_token: string) {
  client.setCredentials({ refresh_token });

  const { token } = await client.getAccessToken();
  const { expiry_date } = client.credentials;

  // TODO: after we have verified that the refresh token was valid and new access token was generated we
  // TODO: might want to generate a new refresh_token and access_token, refresh token rotation, and return those

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
