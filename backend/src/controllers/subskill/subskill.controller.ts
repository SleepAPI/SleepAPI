import { Controller, Get, Route, Tags } from 'tsoa';
import { getSubskillNames } from '../../utils/subskill-utils/subskill-utils';

@Route('api/subskill')
export default class SubskillController extends Controller {
  @Get('/')
  @Tags('subskill')
  public async getSubskills(): Promise<string[]> {
    return getSubskillNames();
  }
}
