import OptimalController from '@src/controllers/optimal/optimal.controller.js';
import type { OptimalSetResult } from '@src/routes/optimal-router/optimal-router.js';
import { WebsiteConverterService } from '@src/services/website-converter/website-converter-service.js';
import { parentPort, workerData } from 'worker_threads';

const { name, body, pretty } = workerData.params;

async function calculateOptimalMeal() {
  const controller = new OptimalController();
  const data: OptimalSetResult = controller.getOptimalPokemonForMealRaw(name, body);

  return pretty ? WebsiteConverterService.toOptimalSet(data) : data;
}

calculateOptimalMeal()
  .then((result) => {
    parentPort?.postMessage(result);
  })
  .catch((err) => {
    parentPort?.postMessage({ error: err.message });
  });
