import workerpool from 'workerpool';
import OptimalController from '../../controllers/optimal/optimal.controller.js';
import type { OptimalSetResult } from '../../routes/optimal-router/optimal-router.js';
import { WebsiteConverterService } from '../../services/website-converter/website-converter-service.js';

async function calculate(name: string, body: any, pretty: boolean) {
  const controller = new OptimalController();
  const data: OptimalSetResult = controller.getOptimalPokemonForMealRaw(name, body);

  return pretty ? WebsiteConverterService.toOptimalSet(data) : data;
}

workerpool.worker({
  calculate
});
