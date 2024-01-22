import { CustomPokemonCombinationWithProduce } from '../combination/custom';
import { Berry } from '../produce/berry';
import { Meal } from '../recipe/meal';
import { Nature } from '../stat/nature';
import { SubSkill } from '../stat/subskill';

export interface ProductionStats {
  level: number;
  nature: Nature;
  subskills?: SubSkill[];
  e4eProcs: number;
  helpingBonus: number;
  goodCamp: boolean;
}

export interface InputProductionStats extends ProductionStats {
  berries: Berry[];
}

export type TeamWithProduce = CustomPokemonCombinationWithProduce[];

export interface TeamsForMeal {
  teams: TeamWithProduce[];
  meal: Meal;
}
