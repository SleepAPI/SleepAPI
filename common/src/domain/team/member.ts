import { IngredientIndexToAmount } from '../ingredient/ingredient';
import { Nature } from '../nature/nature';
import { PokemonWithIngredients, PokemonWithIngredientsIndexed } from '../pokemon/pokemon';

export interface TeamMemberSettings {
  level: number;
  nature: string;
  subskills: string[];
  skillLevel: number;
  carrySize: number;
  ribbon: number;
  externalId: string;
}
export interface TeamMemberSettingsExt {
  level: number;
  nature: Nature;
  subskills: Set<string>;
  skillLevel: number;
  carrySize: number;
  ribbon: number;
  externalId: string;
}

export interface TeamMember {
  pokemonWithIngredients: PokemonWithIngredientsIndexed;
  settings: TeamMemberSettings;
}
export interface TeamMemberExt {
  pokemonWithIngredients: PokemonWithIngredients;
  settings: TeamMemberSettingsExt;
}

export interface TeamMemberWithProduce {
  pokemonWithIngredients: TeamMember;
  producedIngredients: IngredientIndexToAmount;
}
