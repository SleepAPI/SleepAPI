import type { PathKeys } from '../type/type-paths';
import type { ModifierTargetType } from './target-types';

/**
 * Wrapper type to explicitly mark a value as a path reference
 * This allows us to distinguish between literal values and path references at runtime
 *
 * @template T - The target type (Pokemon | PokemonInstance) for type-safe path validation
 */
export class PathReference<T extends ModifierTargetType = ModifierTargetType> {
  constructor(public readonly path: PathKeys<T>) {}

  /**
   * Helper function to create a path reference with type safety
   * @template T - The target type for path validation
   * @param path - Type-safe path from PathKeys<T>
   */
  static to<T extends ModifierTargetType>(path: PathKeys<T>): PathReference<T> {
    return new PathReference<T>(path);
  }
}

/**
 * Type guard to check if a value is a PathReference
 */
export function isPathReference(value: unknown): value is PathReference {
  return value instanceof PathReference;
}

/**
 * Helper function to create a path reference (shorter syntax)
 * @template T - The target type for path validation
 * @param path - Type-safe path from PathKeys<T>
 */
export function pathRef<T extends ModifierTargetType>(path: PathKeys<T>): PathReference<T> {
  return PathReference.to<T>(path);
}
