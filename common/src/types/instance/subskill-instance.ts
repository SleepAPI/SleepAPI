import type { Subskill } from '../subskill/subskill';

export interface SubskillInstanceDto {
  level: number;
  subskill: string;
}
export interface SubskillInstance {
  level: number;
  subskill: Subskill;
}
