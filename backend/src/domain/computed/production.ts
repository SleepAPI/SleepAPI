import type { nature, Time } from 'sleepapi-common';

// TODO: remove in Sleep API 2.0
export interface ProductionStats {
  level: number;
  ribbon: number;
  nature?: nature.Nature;
  subskills?: Set<string>;
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
