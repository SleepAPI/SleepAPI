import type { DetailedProduce } from '../../api/production/produce';
import type { Summary } from '../../api/production/summary';
import type { PokemonIngredientSet } from '../../domain/types/pokemon-ingredient-set';

export interface SingleProductionRequest {
  level: number;
  ribbon: number;
  nature: string;
  subskills: string[];
  e4eProcs: number;
  e4eLevel: number;
  cheer: number;
  extraHelpful: number;
  helperBoostProcs: number;
  helperBoostUnique: number;
  helperBoostLevel: number;
  helpingbonus: number;
  camp: boolean;
  erb: number;
  recoveryIncense: boolean;
  skillLevel: number;
  mainBedtime: string;
  mainWakeup: string;
  ingredientSet: string[];
  nrOfEvolutions?: number;
}

export interface SingleProductionResponse {
  summary: Summary;
  production: {
    pokemonCombination: PokemonIngredientSet; // TODO: remove in Sleep API 2
    detailedProduce: DetailedProduce;
  };
  neutralProduction?: DetailedProduce;
  optimalIngredientProduction?: DetailedProduce;
  optimalBerryProduction?: DetailedProduce;
  optimalSkillProduction?: DetailedProduce;
}
