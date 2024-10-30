import { Produce } from '../../api/production/produce';
import { Mainskill } from '../../domain/mainskill/mainskill';
import { IngredientSet } from '../../domain/types/ingredient-set';
import { Time } from '../../domain/types/time';

export interface Summary {
  ingredientPercentage: number;
  skillPercentage: number;
  carrySize: number;

  skill: Mainskill;
  skillProcs: number;
  skillEnergySelfValue: number;
  skillEnergyOthersValue: number;
  skillProduceValue: Produce;
  skillBerriesOtherValue: number;
  skillStrengthValue: number;
  skillDreamShardValue: number;
  skillPotSizeValue: number;
  skillHelpsValue: number;
  skillTastyChanceValue: number;

  nrOfHelps: number;
  helpsBeforeSS: number;
  helpsAfterSS: number;

  totalProduce: Produce;

  averageEnergy: number;
  averageFrequency: number;

  spilledIngredients: IngredientSet[];

  collectFrequency?: Time;

  totalRecovery: number;
}
