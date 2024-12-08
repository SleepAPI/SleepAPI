import { mockPokemon, PokemonWithIngredients, PokemonWithIngredientsIndexed } from 'sleepapi-common';

export function mockPokemonWithIngredients(attrs?: Partial<PokemonWithIngredients>): PokemonWithIngredients {
  return {
    pokemon: mockPokemon(),
    ingredientList: [],
    ...attrs
  };
}

export function mockPokemonWithIngredientsIndexed(
  attrs?: Partial<PokemonWithIngredientsIndexed>
): PokemonWithIngredientsIndexed {
  return {
    pokemon: mockPokemon().name,
    ingredients: new Int16Array(),
    ...attrs
  };
}
