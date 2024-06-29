import OptimalController from '@src/controllers/optimal/optimal.controller';
import { OptimalFlexibleResult } from '@src/routes/optimal-router/optimal-router';
import { WebsiteConverterService } from '@src/services/website-converter/website-converter-service';
import { parentPort, workerData } from 'worker_threads';

const { body, pretty } = workerData.params;

async function calculateOptimalFlexible() {
  const controller = new OptimalController();
  const data: OptimalFlexibleResult[] = controller.getFlexiblePokemon(body);

  return pretty ? WebsiteConverterService.toOptimalFlexible(data) : data;
}

calculateOptimalFlexible()
  .then((result) => {
    parentPort?.postMessage(result);
  })
  .catch((err) => {
    parentPort?.postMessage({ error: err.message });
  });
