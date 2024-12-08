import { IngredientIndexToIntAmount, PokemonWithIngredientsIndexed, TeamMemberSettingsExt } from 'sleepapi-common';

/**
 * This type represents a Pokémon setup used as input for the set cover algorithm.
 * There will be many of these, both as input for {@link ProducersByIngredientIndex} and output as {@link IngredientProducers}.
 */
export interface SetCoverPokemonSetup {
  pokemonSet: PokemonWithIngredientsIndexed;
  totalIngredients: IngredientIndexToIntAmount;
}

export type IngredientProducers = SetCoverPokemonSetup[];

/**
 * Represents a mapping of ingredient indices to their respective producers.
 * Each index corresponds to an ingredient from the @INGREDIENTS array.
 * Producers are sorted in descending order of production amount.
 */
export type ProducersByIngredientIndex = IngredientProducers[];

/**
 * Used to cache and track the settings associated with a Pokémon setup.
 */
export interface SetCoverPokemonSetupWithSettings extends SetCoverPokemonSetup {
  settings: TeamMemberSettingsExt;
}
export type IngredientProducersWithSettings = SetCoverPokemonSetupWithSettings[];
