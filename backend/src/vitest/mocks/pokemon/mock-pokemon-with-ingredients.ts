import { mockPokemon, PokemonWithIngredients, PokemonWithIngredientsIndexed } from 'sleepapi-common';

export function pokemonWithIngredients(attrs?: Partial<PokemonWithIngredients>): PokemonWithIngredients {
  return {
    pokemon: mockPokemon(),
    ingredientList: [],
    ...attrs
  };
}

export function pokemonWithIngredientsIndexed(
  attrs?: Partial<PokemonWithIngredientsIndexed>
): PokemonWithIngredientsIndexed {
  return {
    pokemon: mockPokemon().name,
    ingredients: new Int16Array(),
    ...attrs
  };
}
