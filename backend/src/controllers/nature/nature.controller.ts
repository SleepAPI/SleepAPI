import { Controller, Get, Route, Tags } from 'tsoa';
import { getNatureNames } from '../../utils/nature-utils/nature-utils';

@Route('api/nature')
export default class NatureController extends Controller {
  @Get('/')
  @Tags('nature')
  public async getNatures(): Promise<string[]> {
    return getNatureNames();
  }
}
