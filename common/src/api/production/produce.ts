import type { SkillActivation } from '../../api/production/skill-activation';
import type { BerrySet } from '../../domain/types/berry-set';
import type { IngredientSet } from '../../domain/types/ingredient-set';

export interface Produce {
  berries: BerrySet[];
  ingredients: IngredientSet[];
}
export function emptyProduce(): Produce {
  return { berries: [], ingredients: [] };
}

export interface DetailedProduce {
  produce: Produce;
  spilledIngredients: IngredientSet[];
  sneakySnack: BerrySet[];
  dayHelps: number;
  nightHelps: number;
  nightHelpsBeforeSS: number;
  averageTotalSkillProcs: number;
  skillActivations: SkillActivation[];
}
