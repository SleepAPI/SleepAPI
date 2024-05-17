import { config } from '@src/config/config';
import { TokenDAO } from '@src/database/dao/user/token-dao';
import { UserDAO } from '@src/database/dao/user/user-dao';
import { AuthorizationError } from '@src/domain/error/api/api-error';
import { getMySQLNow } from '@src/utils/time-utils/time-utils';
import { OAuth2Client, TokenInfo } from 'google-auth-library';
import { DecodedUserData, uuid } from 'sleepapi-common';

export const client = new OAuth2Client({
  clientId: config.GOOGLE_CLIENT_ID,
  clientSecret: config.GOOGLE_CLIENT_SECRET,
  redirectUri: 'postmessage',
});

export async function signup(authorizationCode: string) {
  const { tokens } = await client.getToken({
    code: authorizationCode,
    redirect_uri: 'postmessage',
  });

  if (!tokens.id_token || !tokens.refresh_token || !tokens.access_token || !tokens.expiry_date) {
    throw new AuthorizationError(`Missing data in google getToken response. Response: [${JSON.stringify(tokens)}]`);
  }

  client.setCredentials({ access_token: tokens.access_token });

  const userinfo = await client.request<DecodedUserData>({
    url: 'https://www.googleapis.com/oauth2/v3/userinfo',
  });
  const deviceId = uuid.v4();

  const existingUser = await UserDAO.find({ sub: userinfo.data.sub });
  if (!existingUser) {
    await UserDAO.insert({ sub: userinfo.data.sub, external_id: uuid.v4(), name: 'New user' });
  }
  await TokenDAO.insert({ device_id: deviceId, refresh_token: tokens.refresh_token });

  return {
    idToken: tokens.id_token,
    accessToken: tokens.access_token,
    expiryDate: tokens.expiry_date,
    deviceId,
  };
}

export async function refresh(deviceId: string) {
  const tokenInfo = await TokenDAO.get({ device_id: deviceId });

  client.setCredentials({ refresh_token: tokenInfo.refresh_token });

  const { token } = await client.getAccessToken();
  const { expiry_date } = client.credentials;

  if (!token || !expiry_date) {
    throw new AuthorizationError('Failed to refresh access token');
  }

  await TokenDAO.update({
    ...tokenInfo,
    last_login: getMySQLNow(),
  });

  return {
    accessToken: token,
    expiryDate: expiry_date,
  };
}

export async function verify(accessToken: string) {
  client.setCredentials({ access_token: accessToken });
  const response = await client.request<TokenInfo>({
    url: `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`,
  });
  const tokenInfo = response.data;

  if (tokenInfo.aud !== config.GOOGLE_CLIENT_ID) {
    throw new AuthorizationError('Token was not issued from this server');
  }

  return UserDAO.get({ sub: tokenInfo.sub });
}
