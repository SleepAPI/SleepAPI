import { getSubskill, getSubskillNames, Subskill } from 'sleepapi-common';
import { Controller, Get, Path, Route, Tags } from 'tsoa';

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
