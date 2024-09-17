import ProductionController from '@src/controllers/calculator/production.controller';
import workerpool from 'workerpool';

async function calculateTeam(body: any) {
  const controller = new ProductionController();
  return await controller.calculateTeam(body);
}

workerpool.worker({
  calculateTeam,
});
