import { pokemonWithIngredients } from '@src/vitest/mocks/pokemon/mock-pokemon-with-ingredients.js';
import { teamMemberSettings } from '@src/vitest/mocks/team/mock-team-member-settings-ext.js';
import type { TeamMember } from 'sleepapi-common';

export function teamMember(attrs?: Partial<TeamMember>): TeamMember {
  return {
    pokemonWithIngredients: pokemonWithIngredients(),
    settings: teamMemberSettings(),
    ...attrs
  };
}
