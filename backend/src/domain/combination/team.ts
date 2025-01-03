import type { PokemonIngredientSet, Time, nature, subskill } from 'sleepapi-common';

export interface TeamSettingsExt {
  camp: boolean;
  bedtime: Time;
  wakeup: Time;
}

export interface TeamMember {
  pokemonSet: PokemonIngredientSet;
  level: number;
  ribbon: number;
  carrySize: number;
  skillLevel: number;
  nature: nature.Nature;
  subskills: subskill.SubSkill[];
  externalId: string;
}
