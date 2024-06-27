import { Time } from '@src/domain/time/time';
import { PokemonIngredientSet, nature, subskill } from 'sleepapi-common';

export interface TeamSettings {
  camp: boolean;
  bedtime: Time;
  wakeup: Time;
}

export interface TeamMember {
  pokemonSet: PokemonIngredientSet;
  level: number;
  carrySize: number;
  skillLevel: number;
  nature: nature.Nature;
  subskills: subskill.SubSkill[];
  externalId?: string;
}
