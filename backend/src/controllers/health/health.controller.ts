import { Controller, Get, Hidden, Route, Tags } from 'tsoa';
import { DatabaseService } from '../../database/database-service';
import { Logger } from '../../services/logger/logger';

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
