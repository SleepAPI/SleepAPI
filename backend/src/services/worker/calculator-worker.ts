import workerpool from 'workerpool';
import ProductionController from '../../controllers/calculator/production.controller.js';
import { WebsiteConverterService } from '../../services/website-converter/website-converter-service.js';

async function calculateProduction(name: string, body: any, includeAnalysis: boolean, pretty: boolean) {
  const controller = new ProductionController();
  const data = await controller.calculatePokemonProduction(name, body, includeAnalysis);
  return pretty ? WebsiteConverterService.toProductionCalculator(data) : data;
}

async function calculateTeam(body: any) {
  const controller = new ProductionController();
  return await controller.calculateTeam(body);
}

async function calculateIv(body: any) {
  const controller = new ProductionController();
  return await controller.calculateIv(body);
}

workerpool.worker({
  calculateProduction,
  calculateTeam,
  calculateIv
});
