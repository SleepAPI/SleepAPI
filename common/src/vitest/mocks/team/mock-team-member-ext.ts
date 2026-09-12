import type { TeamMember } from '../../../types/team/member';
import { pokemonWithIngredients } from '../pokemon/mock-pokemon-with-ingredients';
import { teamMemberSettings } from './mock-team-member-settings-ext';

export function teamMember(attrs?: Partial<TeamMember>): TeamMember {
  return {
    pokemonWithIngredients: pokemonWithIngredients(),
    settings: teamMemberSettings(),
    ...attrs
  };
}
