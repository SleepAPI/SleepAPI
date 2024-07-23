import OptimalController from '@src/controllers/optimal/optimal.controller';
import { OptimalSetResult } from '@src/routes/optimal-router/optimal-router';
import { WebsiteConverterService } from '@src/services/website-converter/website-converter-service';
import workerpool from 'workerpool';

async function calculateOptimalMeal(name: string, body: any, pretty: boolean) {
  const controller = new OptimalController();
  const data: OptimalSetResult = controller.getOptimalPokemonForMealRaw(name, body);

  return pretty ? WebsiteConverterService.toOptimalSet(data) : data;
}

workerpool.worker({
  calculateOptimalMeal,
});
