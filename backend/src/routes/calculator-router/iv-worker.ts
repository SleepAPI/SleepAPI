import ProductionController from '@src/controllers/calculator/production.controller';
import { parentPort, workerData } from 'worker_threads';

const { body } = workerData.params;

async function calculateIv() {
  const controller = new ProductionController();
  return await controller.calculateIv(body);
}

calculateIv()
  .then((result) => {
    parentPort?.postMessage(result);
  })
  .catch((err) => {
    parentPort?.postMessage({ error: err.message });
  });
