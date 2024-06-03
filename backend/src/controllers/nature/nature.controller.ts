import { getNatureNames } from 'sleepapi-common';
import { Controller, Get, Route, Tags } from 'tsoa';

@Route('api/nature')
export default class NatureController extends Controller {
  @Get('/')
  @Tags('nature')
  public async getNatures(): Promise<string[]> {
    return getNatureNames();
  }
}
