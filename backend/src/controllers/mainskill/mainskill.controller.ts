import { getMainskill, getMainskillNames } from '@src/utils/mainskill-utils/mainskill-utils.js';
import tsoa from '@tsoa/runtime';
import type { Mainskill } from 'sleepapi-common';
const { Controller, Path, Get, Route, Tags } = tsoa;

@Route('api/mainskill')
@Tags('mainskill')
export default class MainskillController extends Controller {
  @Get('/{name}')
  public async getMainskill(@Path() name: string): Promise<Mainskill> {
    return getMainskill(name);
  }

  @Get('/')
  public async getMainskills(): Promise<string[]> {
    return getMainskillNames();
  }
}
