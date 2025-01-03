/* eslint-disable @typescript-eslint/no-explicit-any */
import workerpool from 'workerpool';
import SolveController from '../../controllers/solve/solve.controller.js';
import { WebsiteConverterService } from '../website-converter/website-converter-service.js';

async function solveRecipe(name: string, body: any, pretty: boolean) {
  const controller = new SolveController();
  const data = controller.solveRecipe(name, body);

  return pretty ? WebsiteConverterService.toOptimalSet(data, name) : data;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function solveIngredient(name: string, body: any, pretty: boolean) {
  const controller = new SolveController();
  return controller.solveIngredient(name, body);
}

workerpool.worker({
  solveRecipe,
  solveIngredient
});
