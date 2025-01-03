import type { SkillActivation } from '../../api/production/skill-activation';
import type { BerrySet } from '../../domain/berry/berry';
import type { IngredientSet } from '../../domain/ingredient/ingredient';

export interface Produce {
  berries: BerrySet[];
  ingredients: IngredientSet[];
}
export interface ProduceFlat {
  berries: Float32Array;
  ingredients: Float32Array;
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
