import { subskill } from 'sleepapi-common';
import { Controller, Get, Path, Route, Tags } from 'tsoa';
import { getSubskill, getSubskillNames } from '../../utils/subskill-utils/subskill-utils';

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
