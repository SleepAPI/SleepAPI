import { config } from '@src/config/config';
import { UserDAO } from '@src/database/dao/user/user-dao';
import { AuthorizationError } from '@src/domain/error/api/api-error';
import { OAuth2Client, TokenInfo } from 'google-auth-library';
import { LoginResponse, RefreshResponse, uuid } from 'sleepapi-common';

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
