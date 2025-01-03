// TODO: remove in sleep api 2
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
