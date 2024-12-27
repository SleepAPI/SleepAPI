import type HealthController from '@src/controllers/health/health.controller.js';
import { BaseRouter } from '@src/routes/base-router.js';

class HealthRouterImpl {
  public async register(controller: HealthController) {
    BaseRouter.router.get('/health', async (req, res) => {
      try {
        logger.log('Entered /health');
        const health = await controller.health();
        res.header('Content-Type', 'application/json').send(JSON.stringify(health, null, 4));
      } catch (err) {
        logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });
  }
}

export const HealthRouter = new HealthRouterImpl();
