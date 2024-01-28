import { berry, nature, recipe, subskill } from 'sleepapi-common';
import { CustomPokemonCombinationWithProduce } from '../combination/custom';

export interface ProductionStats {
  level: number;
  nature: nature.Nature;
  subskills?: subskill.SubSkill[];
  e4eProcs: number;
  helpingBonus: number;
  goodCamp: boolean;
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
