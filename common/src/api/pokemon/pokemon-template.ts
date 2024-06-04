export interface SubskillTemplate {
  level: number;
  subskill: string;
}

export interface IngredientTemplate {
  level: number;
  ingredient: string;
}

export interface PokemonTemplate {
  index: number;
  version: number;
  saved: boolean;
  pokemon: string;
  name: string;
  level: number;
  carrySize: number;
  skillLevel: number;
  nature: string;
  subskills: SubskillTemplate[];
  ingredients: IngredientTemplate[];
}
