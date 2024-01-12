import express from 'express';
import HealthController from '../../controllers/health/health.controller';
import { Logger } from '../../services/logger/logger';

class HealthRouterImpl {
  public router = express.Router();

  public async register(controller: HealthController) {
    this.router.get('/health', async (req, res) => {
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
