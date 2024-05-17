import { refresh, signup } from '@src/services/api-service/login/login-service';
import { Body, Controller, Hidden, Post, Route } from 'tsoa';

@Route('api/login')
@Hidden()
export default class LoginController extends Controller {
  @Post('/signup')
  public async signup(@Body() body: { authorizationCode: string }) {
    return await signup(body.authorizationCode);
  }

  @Post('/refresh')
  public async refresh(@Body() body: { deviceId: string }) {
    const { deviceId } = body;

    return await refresh(deviceId);
  }
}
