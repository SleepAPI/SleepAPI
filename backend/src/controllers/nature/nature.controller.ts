import * as tsoa from '@tsoa/runtime';
import { getNatureNames } from 'sleepapi-common';
const { Controller, Route, Tags, Get } = tsoa;

@Route('api/nature')
export default class NatureController extends Controller {
  @Get('/')
  @Tags('nature')
  public async getNatures(): Promise<string[]> {
    return getNatureNames();
  }
}
