import { berry, nature, Recipe, subskill, Time } from 'sleepapi-common';
import { CustomPokemonCombinationWithProduce } from '../combination/custom';

export interface ProductionStats {
  level: number;
  ribbon: number;
  nature?: nature.Nature;
  subskills?: subskill.SubSkill[];
  skillLevel?: number;
  inventoryLimit?: number;
  e4eProcs: number;
  e4eLevel: number;
  cheer: number;
  extraHelpful: number;
  helperBoostProcs: number;
  helperBoostUnique: number;
  helperBoostLevel: number;
  helpingBonus: number;
  camp: boolean;
  erb: number;
  incense: boolean;
  mainBedtime: Time;
  mainWakeup: Time;
  maxPotSize?: number;
}

export interface SetCoverProductionStats extends ProductionStats {
  berries: berry.Berry[];
}

export type TeamWithProduce = CustomPokemonCombinationWithProduce[];

export interface TeamsForMeal {
  teams: TeamWithProduce[];
  meal: Recipe;
}
