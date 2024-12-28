import type { PokemonGender } from '../../domain/gender/gender';

export interface SubskillInstance {
  level: number;
  subskill: string;
}

export interface IngredientInstance {
  level: number;
  ingredient: string;
}

export interface PokemonInstance {
  pokemon: string;
  level: number;
  ribbon: number;
  carrySize: number;
  skillLevel: number;
  nature: string;
  subskills: SubskillInstance[];
  ingredients: IngredientInstance[];
}

export interface PokemonInstanceWithMeta extends PokemonInstance {
  version: number;
  externalId: string;
  saved: boolean;
  shiny: boolean;
  gender: PokemonGender;
  name: string;
}
