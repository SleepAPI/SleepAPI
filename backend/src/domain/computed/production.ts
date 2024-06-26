import { berry, nature, Recipe, subskill } from 'sleepapi-common';
import { CustomPokemonCombinationWithProduce } from '../combination/custom';
import { Time } from '../time/time';

export interface ProductionStats {
  level: number;
  nature?: nature.Nature;
  subskills?: subskill.SubSkill[];
  skillLevel?: number;
  maxCarrySize?: number;
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
