import { SetCoverPokemonWithSettings } from '@src/services/solve/solve-service.js';
import { mockPokemonWithIngredientsIndexed } from '@src/vitest/mocks/pokemon/mock-pokemon-with-ingredients.js';
import { teamMemberSettingsExt } from '@src/vitest/mocks/team/mock-team-member-settings-ext.js';

export function setCoverPokemonWithSettings(attrs?: Partial<SetCoverPokemonWithSettings>): SetCoverPokemonWithSettings {
  return {
    pokemonSet: mockPokemonWithIngredientsIndexed(),
    totalIngredients: new Int16Array(),
    settings: teamMemberSettingsExt(),
    ...attrs
  };
}
