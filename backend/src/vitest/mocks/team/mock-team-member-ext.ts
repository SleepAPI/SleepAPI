import { pokemonWithIngredients } from '@src/vitest/mocks/pokemon/mock-pokemon-with-ingredients.js';
import { teamMemberSettingsExt } from '@src/vitest/mocks/team/mock-team-member-settings-ext.js';
import { TeamMemberExt } from 'sleepapi-common';

export function teamMemberExt(attrs?: Partial<TeamMemberExt>): TeamMemberExt {
  return {
    pokemonWithIngredients: pokemonWithIngredients(),
    settings: teamMemberSettingsExt(),
    ...attrs
  };
}
