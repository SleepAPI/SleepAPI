import type { PokemonGender } from '../gender/gender';
import type { Nature } from '../nature/nature';
import type { Pokemon } from '../pokemon/pokemon';
import type { IngredientInstance, IngredientInstanceExt } from './ingredient-instance';
import type { SubskillInstance, SubskillInstanceExt } from './subskill-instance';

export interface PokemonInstanceBase<PokemonType, NatureType, SubskillType, IngredientType> {
  pokemon: PokemonType;
  level: number;
  ribbon: number;
  carrySize: number;
  skillLevel: number;
  nature: NatureType;
  subskills: SubskillType[];
  ingredients: IngredientType[];
  sneakySnacking: boolean;
}
export type PokemonInstance = PokemonInstanceBase<
  string, // Pokemon as a simple string ID
  string, // Nature as a string
  SubskillInstance, // Simple representation of subskills
  IngredientInstance // simple representation of ingredients
>;

export interface PokemonInstanceMeta {
  version: number;
  externalId: string;
  saved: boolean;
  shiny: boolean;
  gender: PokemonGender;
  name: string;
}
export type PokemonInstanceWithMeta = PokemonInstance & PokemonInstanceMeta;

export interface PokemonInstanceExt
  extends PokemonInstanceBase<Pokemon, Nature, SubskillInstanceExt, IngredientInstanceExt>,
    PokemonInstanceMeta {
  rp: number;
}
