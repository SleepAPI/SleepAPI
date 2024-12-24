import * as tsoa from '@tsoa/runtime';
import type { subskill } from 'sleepapi-common';
import { getSubskill, getSubskillNames } from 'sleepapi-common';
const { Controller, Path, Route, Tags, Get } = tsoa;

@Route('api/subskill')
@Tags('subskill')
export default class SubskillController extends Controller {
  @Get('/{name}')
  public async getSubskill(@Path() name: string): Promise<subskill.SubSkill> {
    return getSubskill(name);
  }

  @Get('/')
  public async getSubskills(): Promise<string[]> {
    return getSubskillNames();
  }
}
