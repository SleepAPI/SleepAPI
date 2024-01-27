import { DatabaseService } from '@src/database/database-service';
import { Logger } from '@src/services/logger/logger';
import { Controller, Get, Hidden, Route, Tags } from 'tsoa';

@Route('health')
@Tags('system')
export default class HealthController extends Controller {
  @Get('/')
  @Hidden()
  public async health() {
    const knex = await DatabaseService.getKnex();
    return await knex
      .raw('SELECT 1')
      .then(() => ({
        status: 'healthy',
      }))
      .catch((e) => {
        Logger.error(e);
        return {
          status: 'unhealthy',
        };
      });
  }
}
