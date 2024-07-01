import { Ingredient } from '../../domain/ingredient';
import { Nature } from '../../domain/nature';
import { Pokemon } from '../../domain/pokemon';
import { SubSkill } from '../../domain/subskill';

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
  externalId: string;
  pokemon: Pokemon;
  name: string;
  level: number;
  carrySize: number;
  skillLevel: number;
  nature: Nature;
  subskills: SubskillInstanceExt[];
  ingredients: IngredientInstanceExt[];
  rp?: number;
}
