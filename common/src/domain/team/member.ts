import type { IngredientSet } from '../ingredient/ingredient';
import type { Nature } from '../nature/nature';
import type { PokemonWithIngredients, PokemonWithIngredientsIndexed } from '../pokemon/pokemon';

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
export type TeamMemberSettingsResult = Omit<TeamMemberSettingsExt, 'subskills'> & { subskills: string[] };

export interface TeamMemberWithProduce {
  member: Omit<TeamMemberExt, 'settings'> & { settings: TeamMemberSettingsResult };
  producedIngredients: IngredientSet[];
}
