import tsoa from '@tsoa/runtime';
import type { Subskill } from 'sleepapi-common';
import { getSubskill, getSubskillNames } from 'sleepapi-common';
const { Controller, Path, Get, Route, Tags } = tsoa;

@Route('api/subskill')
@Tags('subskill')
export default class SubskillController extends Controller {
  @Get('/{name}')
  public async getSubskill(@Path() name: string): Promise<Subskill> {
    return getSubskill(name);
  }

  @Get('/')
  public async getSubskills(): Promise<string[]> {
    return getSubskillNames();
  }
}
