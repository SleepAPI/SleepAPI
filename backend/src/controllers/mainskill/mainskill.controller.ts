import { getMainskill, getMainskillNames } from '@src/utils/mainskill-utils/mainskill-utils';
import { Mainskill } from 'sleepapi-common';
import { Controller, Get, Path, Route, Tags } from 'tsoa';

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
