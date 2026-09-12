import { describe, expect, it } from 'vitest';
import type { PokemonInstance } from '../../types';
import { PathReference, isPathReference, pathRef } from './path-reference';

describe('PathReference', () => {
  describe('constructor', () => {
    it('should create a PathReference with a path', () => {
      const pathRef = new PathReference<PokemonInstance>('name');
      expect(pathRef.path).toBe('name');
    });

    it('should support nested paths', () => {
      const pathRef = new PathReference<PokemonInstance>('pokemon.berry.name');
      expect(pathRef.path).toBe('pokemon.berry.name');
    });

    it('should support array paths', () => {
      const pathRef = new PathReference<PokemonInstance>('pokemon.ingredient0.0.amount');
      expect(pathRef.path).toBe('pokemon.ingredient0.0.amount');
    });

    it('should support wildcard array paths', () => {
      const pathRef = new PathReference<PokemonInstance>('pokemon.ingredient0.*.amount');
      expect(pathRef.path).toBe('pokemon.ingredient0.*.amount');
    });
  });

  describe('static to() method', () => {
    it('should create a PathReference using static method', () => {
      const pathRef = PathReference.to<PokemonInstance>('pokemon.frequency');
      expect(pathRef).toBeInstanceOf(PathReference);
      expect(pathRef.path).toBe('pokemon.frequency');
    });

    it('should support Pokemon instance paths', () => {
      const pathRef = PathReference.to<PokemonInstance>('pokemon.name');
      expect(pathRef.path).toBe('pokemon.name');
    });

    it('should support deeply nested paths', () => {
      const pathRef = PathReference.to<PokemonInstance>('pokemon.berry.name');
      expect(pathRef.path).toBe('pokemon.berry.name');
    });

    it('should support skill-related paths', () => {
      const pathRef = PathReference.to<PokemonInstance>('pokemon.skill.maxLevel');
      expect(pathRef.path).toBe('pokemon.skill.maxLevel');
    });
  });

  describe('isPathReference type guard', () => {
    it('should return true for PathReference instances', () => {
      const pathRef = PathReference.to<PokemonInstance>('name');
      expect(isPathReference(pathRef)).toBe(true);
    });

    it('should return false for non-PathReference values', () => {
      expect(isPathReference('string')).toBe(false);
      expect(isPathReference(42)).toBe(false);
      expect(isPathReference(null)).toBe(false);
      expect(isPathReference(undefined)).toBe(false);
      expect(isPathReference({})).toBe(false);
      expect(isPathReference([])).toBe(false);
    });

    it('should work as a type guard in conditional blocks', () => {
      const value: unknown = PathReference.to<PokemonInstance>('pokemon.frequency');

      if (isPathReference(value)) {
        // TypeScript should know this is a PathReference
        expect(value.path).toBe('pokemon.frequency');
      } else {
        // This should not execute
        expect.fail('Expected value to be a PathReference');
      }
    });
  });

  describe('pathRef helper function', () => {
    it('should create a PathReference using helper function', () => {
      const pathReference = pathRef<PokemonInstance>('pokemon.specialty');
      expect(pathReference).toBeInstanceOf(PathReference);
      expect(pathReference.path).toBe('pokemon.specialty');
    });

    it('should be equivalent to PathReference.to()', () => {
      const path = 'pokemon.ingredientPercentage' as const;
      const pathRef1 = pathRef<PokemonInstance>(path);
      const pathRef2 = PathReference.to<PokemonInstance>(path);

      expect(pathRef1.path).toBe(pathRef2.path);
      expect(pathRef1).toBeInstanceOf(PathReference);
      expect(pathRef2).toBeInstanceOf(PathReference);
    });
  });

  describe('type safety', () => {
    it('should enforce type-safe paths for Pokemon', () => {
      // These should compile without errors
      const validPaths = [
        PathReference.to<PokemonInstance>('pokemon.name'),
        PathReference.to<PokemonInstance>('pokemon.frequency'),
        PathReference.to<PokemonInstance>('pokemon.berry.name'),
        PathReference.to<PokemonInstance>('pokemon.skill.maxLevel'),
        PathReference.to<PokemonInstance>('pokemon.ingredient0.0.amount')
      ];

      validPaths.forEach((pathRef) => {
        expect(pathRef).toBeInstanceOf(PathReference);
        expect(typeof pathRef.path).toBe('string');
      });
    });

    it('should enforce type-safe paths for PokemonInstance', () => {
      // These should compile without errors
      const validPaths = [
        PathReference.to<PokemonInstance>('skillLevel'),
        PathReference.to<PokemonInstance>('pokemon.name'),
        PathReference.to<PokemonInstance>('pokemon.frequency'),
        PathReference.to<PokemonInstance>('pokemon.berry.name'),
        PathReference.to<PokemonInstance>('level'),
        PathReference.to<PokemonInstance>('ribbon')
      ];

      validPaths.forEach((pathRef) => {
        expect(pathRef).toBeInstanceOf(PathReference);
        expect(typeof pathRef.path).toBe('string');
      });
    });

    it('should reject invalid paths at compile time', () => {
      // @ts-expect-error - invalid path
      PathReference.to<PokemonInstance>('invalidPath');
      // @ts-expect-error - invalid path
      pathRef<PokemonInstance>('wrongProperty');
    });
  });

  describe('runtime behavior', () => {
    it('should preserve path string at runtime', () => {
      const originalPath = 'pokemon.skill.maxLevel';
      const pathRef = PathReference.to<PokemonInstance>(originalPath);
      expect(pathRef.path).toBe(originalPath);
    });

    it('should be distinguishable from regular strings', () => {
      const pathString = 'pokemon.frequency';
      const pathRef = PathReference.to<PokemonInstance>(pathString);

      expect(pathRef.path).toBe(pathString);
      expect(pathRef).not.toBe(pathString);
      expect(isPathReference(pathRef)).toBe(true);
      expect(isPathReference(pathString)).toBe(false);
    });

    it('should support complex path structures', () => {
      const complexPaths = [
        'ingredients.0.ingredient.name',
        'ingredients.*.ingredient.name',
        'subskills.0.subskill.name'
      ] as const;

      complexPaths.forEach((path) => {
        const pathRef = PathReference.to<PokemonInstance>(path);
        expect(pathRef.path).toBe(path);
        expect(isPathReference(pathRef)).toBe(true);
      });
    });
  });

  describe('usage in conditions', () => {
    it('should work in modifier conditions for cross-property comparisons', () => {
      // Example: skillLevel < pokemon.skill.maxLevel
      const conditionValue = PathReference.to<PokemonInstance>('pokemon.skill.maxLevel');

      expect(conditionValue.path).toBe('pokemon.skill.maxLevel');
      expect(isPathReference(conditionValue)).toBe(true);

      // This would be used in a condition like:
      // { path: 'skillLevel', operation: '<', value: conditionValue }
    });

    it('should enable dynamic value comparisons', () => {
      // Example: frequency < berry.strength (if such properties existed)
      const dynamicValue = PathReference.to<PokemonInstance>('pokemon.ingredientPercentage');

      expect(dynamicValue.path).toBe('pokemon.ingredientPercentage');
      expect(isPathReference(dynamicValue)).toBe(true);
    });
  });

  describe('integration with existing types', () => {
    it('should integrate with PathKeys type', () => {
      // The fact that these compile shows integration with PathKeys<T>
      const pokemonPathRef = PathReference.to<PokemonInstance>('name');
      const instancePathRef = PathReference.to<PokemonInstance>('skillLevel');

      expect(pokemonPathRef.path).toBe('name');
      expect(instancePathRef.path).toBe('skillLevel');
    });

    it('should support paths that work with PathValue type', () => {
      // These paths should be compatible with PathValue<T, P>
      const stringPath = PathReference.to<PokemonInstance>('pokemon.name'); // PathValue<PokemonInstance, 'pokemon.name'> = string
      const numberPath = PathReference.to<PokemonInstance>('pokemon.frequency'); // PathValue<PokemonInstance, 'pokemon.frequency'> = number
      const nestedPath = PathReference.to<PokemonInstance>('pokemon.berry.name'); // PathValue<PokemonInstance, 'pokemon.berry.name'> = string

      expect(stringPath.path).toBe('pokemon.name');
      expect(numberPath.path).toBe('pokemon.frequency');
      expect(nestedPath.path).toBe('pokemon.berry.name');
    });
  });
});
