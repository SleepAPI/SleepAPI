import SolveController from '@src/controllers/solve/solve.controller.js';
import { WebsiteConverterService } from '@src/services/website-converter/website-converter-service.js';
import { SolveRecipeResponse } from 'sleepapi-common';
import workerpool from 'workerpool';

// TODO: remove in Sleep API 2.0
async function solveRecipe(name: string, body: any, pretty: boolean) {
  const controller = new SolveController();
  const data: SolveRecipeResponse = await controller.solveRecipe(name, body);

  return pretty ? WebsiteConverterService.toOptimalSet(data) : data;
}

workerpool.worker({
  solveRecipe
});
