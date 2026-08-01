import type { IngredientSet } from '../ingredient/ingredient';
import type { Nature } from '../nature/nature';
import type { PokemonWithIngredients, PokemonWithIngredientsIndexed } from '../pokemon/pokemon';

export interface TeamMemberSettingsDto {
  level: number;
  nature: string;
  subskills: string[];
  skillLevel: number;
  carrySize: number;
  ribbon: number;
  externalId: string;
  sneakySnacking: boolean;
}
export interface TeamMemberSettings {
  level: number;
  nature: Nature;
  subskills: Set<string>;
  skillLevel: number;
  carrySize: number;
  ribbon: number;
  externalId: string;
  sneakySnacking: boolean;
}

export interface TeamMemberDto {
  pokemonWithIngredients: PokemonWithIngredientsIndexed;
  settings: TeamMemberSettingsDto;
}
export interface TeamMember {
  pokemonWithIngredients: PokemonWithIngredients;
  settings: TeamMemberSettings;
}
export type TeamMemberSettingsResult = Omit<TeamMemberSettings, 'subskills'> & { subskills: string[] };

export interface TeamMemberWithProduce {
  member: Omit<TeamMember, 'settings'> & { settings: TeamMemberSettingsResult };
  producedIngredients: IngredientSet[];
}
