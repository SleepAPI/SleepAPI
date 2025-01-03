import { pokemonWithIngredients } from '@src/bun/mocks/pokemon/mock-pokemon-with-ingredients.js';
import { teamMemberSettingsExt } from '@src/bun/mocks/team/mock-team-member-settings-ext.js';
import type { TeamMemberExt } from 'sleepapi-common';

export function teamMemberExt(attrs?: Partial<TeamMemberExt>): TeamMemberExt {
  return {
    pokemonWithIngredients: pokemonWithIngredients(),
    settings: teamMemberSettingsExt(),
    ...attrs
  };
}
