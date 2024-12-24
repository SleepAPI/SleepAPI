import { DatabaseService } from '@src/database/database-service.js';
import tsoa from '@tsoa/runtime';
const { Controller, Get, Hidden, Route, Tags } = tsoa;

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
        status: 'healthy'
      }))
      .catch((e) => {
        logger.error(e);
        return {
          status: 'unhealthy'
        };
      });
  }
}
