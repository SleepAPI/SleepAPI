export interface SubskillInstance {
  level: number;
  subskill: string;
}

export interface IngredientInstance {
  level: number;
  ingredient: string;
}

export interface PokemonInstance {
  version: number;
  externalId: string;
  saved: boolean;
  pokemon: string;
  name: string;
  level: number;
  carrySize: number;
  skillLevel: number;
  nature: string;
  subskills: SubskillInstance[];
  ingredients: IngredientInstance[];
}
