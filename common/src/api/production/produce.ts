import { SkillActivation } from '../../api/production/skill-activation';
import { BerrySet } from '../../domain/types/berry-drop';
import { IngredientSet } from '../../domain/types/ingredient-set';

export interface Produce {
  berries?: BerrySet;
  ingredients: IngredientSet[];
}

export interface DetailedProduce {
  produce: Produce;
  spilledIngredients: IngredientSet[];
  sneakySnack?: BerrySet;
  dayHelps: number;
  nightHelps: number;
  nightHelpsBeforeSS: number;
  averageTotalSkillProcs: number;
  skillActivations: SkillActivation[];
}
