import type { IngredientSetSimple } from '../ingredient';
import type { PokemonWithIngredientsSimple } from '../pokemon/pokemon';
import type { Recipe } from '../recipe/recipe';
import type { TeamMemberSettingsDto } from '../team';
import type { Tier } from './tier';

export interface TeamMemberProduction extends PokemonWithIngredientsSimple {
  nature: string;
  subskills: string[];
  totalProduction: Float32Array;
}

export interface RecipeContributionSimple {
  coverage: number;
  skillValue: number;
  score: number;
  recipe: string;
  team: TeamMemberProduction[];
}

export interface RecipeContribution extends Omit<RecipeContributionSimple, 'recipe'> {
  recipe: Recipe;
}

export interface PokemonWithRecipeContributions {
  pokemonWithSettings: {
    pokemon: string;
    ingredientList: IngredientSetSimple[];
    totalIngredients: Float32Array;
    critMultiplier: number;
    averageWeekdayPotSize: number;
    settings: TeamMemberSettingsDto;
  };
  contributions: RecipeContributionSimple[];
}
export interface PokemonWithFinalContribution extends PokemonWithRecipeContributions {
  score: number;
}
export interface PokemonWithTiering extends PokemonWithFinalContribution {
  tier: Tier;
  diff?: number;
}
