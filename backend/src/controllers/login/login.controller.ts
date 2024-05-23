import { refresh, signup } from '@src/services/api-service/login/login-service';

export default class LoginController {
  public async signup(body: { authorization_code: string }) {
    return await signup(body.authorization_code);
  }

  public async refresh(body: { refresh_token: string }) {
    const { refresh_token } = body;

    return await refresh(refresh_token);
  }
}
