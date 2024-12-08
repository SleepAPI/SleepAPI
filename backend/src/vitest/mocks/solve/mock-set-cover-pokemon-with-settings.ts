import { SetCoverPokemonWithSettings } from '@src/services/solve/solve-service.js';
import { SetCoverPokemonSetup } from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import { mockPokemonWithIngredientsIndexed } from '@src/vitest/mocks/pokemon/mock-pokemon-with-ingredients.js';
import { teamMemberSettingsExt } from '@src/vitest/mocks/team/mock-team-member-settings-ext.js';

export function setCoverPokemonSetup(attrs?: Partial<SetCoverPokemonSetup>): SetCoverPokemonSetup {
  return {
    pokemonSet: mockPokemonWithIngredientsIndexed(),
    totalIngredients: new Int16Array(),
    ...attrs
  };
}

export function setCoverPokemonWithSettings(attrs?: Partial<SetCoverPokemonWithSettings>): SetCoverPokemonWithSettings {
  return {
    pokemonSet: mockPokemonWithIngredientsIndexed(),
    totalIngredients: new Int16Array(),
    settings: teamMemberSettingsExt(),
    ...attrs
  };
}
