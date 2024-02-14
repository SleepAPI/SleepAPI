import { berry, nature, recipe, subskill } from 'sleepapi-common';
import { CustomPokemonCombinationWithProduce } from '../combination/custom';
import { Time } from '../time/time';

export interface ProductionStats {
  level: number;
  nature: nature.Nature;
  subskills?: subskill.SubSkill[];
  e4e: number;
  helpingBonus: number;
  camp: boolean;
  erb: number;
  incense: boolean;
  mainBedtime: Time;
  mainWakeup: Time;
  maxPotSize?: number;
}

export interface InputProductionStats extends ProductionStats {
  berries: berry.Berry[];
}

export type TeamWithProduce = CustomPokemonCombinationWithProduce[];

export interface TeamsForMeal {
  teams: TeamWithProduce[];
  meal: recipe.Recipe;
}
