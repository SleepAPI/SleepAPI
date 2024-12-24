/* eslint-disable @typescript-eslint/no-explicit-any */
import SolveController from '@src/controllers/solve/solve.controller.js';
import workerpool from 'workerpool';

async function solveRecipe(name: string, body: any, pretty: boolean) {
  const controller = new SolveController();
  return controller.solveRecipe(name, body);

  // TODO: remove in Sleep API 2.0
  // return pretty ? WebsiteConverterService.toOptimalSet(data) : data;
}

workerpool.worker({
  solveRecipe
});
