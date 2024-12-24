import ProductionController from '@src/controllers/calculator/production.controller';
import { parentPort, workerData } from 'worker_threads';

const { body } = workerData.params;

async function calculateTeam() {
  const controller = new ProductionController();
  return await controller.calculateTeam(body);
}

calculateTeam()
  .then((result) => {
    parentPort?.postMessage(result);
  })
  .catch((err) => {
    parentPort?.postMessage({ error: err.message });
  });
