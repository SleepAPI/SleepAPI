import type { PokemonGender } from '../gender/gender';
import type { Nature } from '../nature/nature';
import type { Pokemon } from '../pokemon/pokemon';
import type { IngredientInstance, IngredientInstanceDto } from './ingredient-instance';
import type { SubskillInstance, SubskillInstanceDto } from './subskill-instance';

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
export type PokemonInstanceDto = PokemonInstanceBase<
  string, // Pokemon as a simple string ID
  string, // Nature as a string
  SubskillInstanceDto, // Simple representation of subskills
  IngredientInstanceDto // simple representation of ingredients
>;

export interface PokemonInstanceMeta {
  version: number;
  externalId: string;
  saved: boolean;
  shiny: boolean;
  gender: PokemonGender;
  name: string;
}
export type PokemonInstanceWithMeta = PokemonInstanceDto & PokemonInstanceMeta;

export interface PokemonInstance
  extends PokemonInstanceBase<Pokemon, Nature, SubskillInstance, IngredientInstance>, PokemonInstanceMeta {
  rp: number;
}
