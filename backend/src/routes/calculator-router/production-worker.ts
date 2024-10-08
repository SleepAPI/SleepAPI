import ProductionController from '@src/controllers/calculator/production.controller';
import { WebsiteConverterService } from '@src/services/website-converter/website-converter-service';
import { parentPort, workerData } from 'worker_threads';

const { name, body, pretty, includeAnalysis } = workerData.params;

async function calculateProduction() {
  const controller = new ProductionController();
  const productionDataRaw = await controller.calculatePokemonProduction(name, body, includeAnalysis);
  const result = pretty ? WebsiteConverterService.toProductionCalculator(productionDataRaw) : productionDataRaw;
  return result;
}

calculateProduction()
  .then((result) => {
    parentPort?.postMessage(result);
  })
  .catch((err) => {
    parentPort?.postMessage({ error: err.message });
  });
