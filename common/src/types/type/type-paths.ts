/**
 * Type-Safe Path Extraction for Modifiers
 *
 * This utility type extracts all valid dot-separated paths from a type T.
 * It correctly generates paths for nested objects and catches invalid paths during compilation.
 *
 * Example:
 * - For type { outer: { inner: { value: number } } }
 * - Correctly generates: 'outer' | 'outer.inner' | 'outer.inner.value'
 * - Correctly rejects: 'inner.value' | 'value' (not valid root paths)
 *
 * Usage in EventBuilder:
 * - .forPokemon((input, pokemon) => ({ 'pokemon.frequency': ... }))
 * - .forTeam((input, member) => ({ 'pokemonWithIngredients.pokemon.frequency': ... }))
 * - .forStrength((input, strength) => ({ 'berries.breakdown.favored': ... }))
 *
 * PathKeys provides autocomplete for valid paths and runtime validation catches invalid paths.
 */
type PathsOfObject<T, Prefix extends string = ''> = {
  [K in keyof T & string]: NonNullable<T[K]> extends Array<infer U>
    ? U extends object
      ?
          | `${Prefix}${K}`
          | `${Prefix}${K}.${number}`
          | `${Prefix}${K}.*`
          | PathsOfObject<U, `${Prefix}${K}.${number}.`>
          | PathsOfObject<U, `${Prefix}${K}.*.`>
      : `${Prefix}${K}` | `${Prefix}${K}.${number}` | `${Prefix}${K}.*`
    : NonNullable<T[K]> extends object
      ? `${Prefix}${K}` | PathsOfObject<NonNullable<T[K]>, `${Prefix}${K}.`>
      : `${Prefix}${K}`;
}[keyof T & string];

/**
 * Used for extracting type-safe paths from objects with depth limiting
 *
 * @returns a string of keys separated by dots
 *
 * @example
 * ```
 * PathKeys<Pokemon> // 'name' | 'berry.name' | 'ingredient0.*.amount' | 'ingredient0.0.amount' ...
 * ```
 */
export type PathKeys<T> = T extends object ? PathsOfObject<T> : never;
