import { refresh, signup } from '@src/services/api-service/login/login-service';
import { Body, Controller, Hidden, Post, Route } from 'tsoa';

@Route('api/login')
@Hidden()
export default class LoginController extends Controller {
  @Post('/signup')
  public async signup(@Body() body: { authorization_code: string }) {
    return await signup(body.authorization_code);
  }

  @Post('/refresh')
  public async refresh(@Body() body: { refresh_token: string }) {
    const { refresh_token } = body;

    return await refresh(refresh_token);
  }
}
