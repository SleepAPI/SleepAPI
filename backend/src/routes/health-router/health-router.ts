import HealthController from '@src/controllers/health/health.controller';
import { Logger } from '@src/services/logger/logger';
import { BaseRouter } from '../base-router';

class HealthRouterImpl {
  public async register(controller: HealthController) {
    BaseRouter.router.get('/health', async (req, res) => {
      try {
        Logger.log('Entered /health');
        const health = await controller.health();
        res.header('Content-Type', 'application/json').send(JSON.stringify(health, null, 4));
      } catch (err) {
        Logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });
  }
}

export const HealthRouter = new HealthRouterImpl();
