import OptimalController from '@src/controllers/optimal/optimal.controller.js';
import type { IngredientRankerResult } from '@src/routes/optimal-router/optimal-router.js';
import { WebsiteConverterService } from '@src/services/website-converter/website-converter-service.js';
import { parentPort, workerData } from 'worker_threads';

const { name, body, pretty } = workerData.params;

async function calculateOptimalIngredient() {
  const controller = new OptimalController();
  const data: IngredientRankerResult = controller.getOptimalPokemonForIngredientRaw(name, body);

  return pretty ? WebsiteConverterService.toIngredientRanker(data) : data;
}

calculateOptimalIngredient()
  .then((result) => {
    parentPort?.postMessage(result);
  })
  .catch((err) => {
    parentPort?.postMessage({ error: err.message });
  });
