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
  name: string;
}
