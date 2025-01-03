import { DatabaseService } from '@src/database/database-service.js';

export default class HealthController {
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
