export interface InstancedSubskill {
  level: number;
  subskill: string;
}

export interface InstancedIngredient {
  level: number;
  ingredient: string;
}

export interface InstancedPokemon {
  index: number;
  saved: boolean;
  pokemon: string;
  name: string;
  level: number;
  carrySize: number;
  skillLevel: number;
  nature: string;
  subskills: InstancedSubskill[];
  ingredients: InstancedIngredient[];
}
