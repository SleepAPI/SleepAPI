import ProductionController from '@src/controllers/calculator/production.controller';
import workerpool from 'workerpool';

async function calculateIv(body: any) {
  const controller = new ProductionController();
  return await controller.calculateIv(body);
}

workerpool.worker({
  calculateIv,
});
