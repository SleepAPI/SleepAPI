import type { PokemonGender } from '../../domain/gender/gender';
import type { Ingredient } from '../../domain/ingredient';
import type { Nature } from '../../domain/nature';
import type { Pokemon } from '../../domain/pokemon';
import type { SubSkill } from '../../domain/subskill';

export interface IngredientInstanceExt {
  level: number;
  ingredient: Ingredient; // TODO: this should probably be IngredientSet
}
export interface SubskillInstanceExt {
  level: number;
  subskill: SubSkill;
}

// TODO: maybe should split into meta that extends this with version, saved etc
export interface PokemonInstanceExt {
  version: number;
  saved: boolean;
  shiny: boolean;
  gender: PokemonGender;
  externalId: string;
  pokemon: Pokemon;
  name: string;
  level: number;
  ribbon: number;
  carrySize: number;
  skillLevel: number;
  nature: Nature;
  subskills: SubskillInstanceExt[];
  ingredients: IngredientInstanceExt[];
  rp?: number;
}
