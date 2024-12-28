/* eslint-disable @typescript-eslint/no-explicit-any */
import workerpool from 'workerpool';
import OptimalController from '../../controllers/optimal/optimal.controller.js';
import type { IngredientRankerResult, OptimalSetResult } from '../../routes/optimal-router/optimal-router.js';
import { WebsiteConverterService } from '../../services/website-converter/website-converter-service.js';

async function calculateMeal(name: string, body: any, pretty: boolean) {
  const controller = new OptimalController();
  const data: OptimalSetResult = controller.getOptimalPokemonForMealRaw(name, body);

  return pretty ? WebsiteConverterService.toOptimalSet(data) : data;
}

async function calculateIngredient(name: string, body: any, pretty: boolean) {
  const controller = new OptimalController();
  const data: IngredientRankerResult = controller.getOptimalPokemonForIngredientRaw(name, body);

  return pretty ? WebsiteConverterService.toIngredientRanker(data) : data;
}

workerpool.worker({
  calculateMeal,
  calculateIngredient
});
