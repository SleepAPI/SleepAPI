import { describe, expect, it } from 'vitest';
import type { PokemonInstance } from '../instance';
import type { ConditionOperation, Modifier, ModifierOperation } from './modifier';

describe('Modifier', () => {
  describe('ModifierOperation', () => {
    it('should only allow valid operations', () => {
      const validOperations: ModifierOperation[] = ['*', '+', '-', '/', '='];

      // @ts-expect-error - invalid operation
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const invalidOperation: ModifierOperation = 'invalid';

      expect(validOperations).toEqual(['*', '+', '-', '/', '=']);
    });
  });

  describe('ConditionOperation', () => {
    it('should only allow valid operations', () => {
      const validOperations: ConditionOperation[] = ['=', '!=', '>', '<', '>=', '<=', 'in', 'not-in'];

      // @ts-expect-error - invalid operation
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const invalidOperation: ConditionOperation = 'invalid';

      expect(validOperations).toEqual(['=', '!=', '>', '<', '>=', '<=', 'in', 'not-in']);
    });
  });

  describe('Modifier', () => {
    it('should create a valid modifier', () => {
      const modifier: Modifier<PokemonInstance> = {
        type: 'PokemonInstanceDto',
        leftValue: 'pokemon.frequency',
        operation: '*',
        rightValue: 0.9,
        conditions: [
          {
            leftValue: 'pokemon.specialty',
            operation: '=',
            rightValue: 'berry'
          }
        ]
      };

      expect(modifier.type).toBe('PokemonInstanceDto');
      expect(modifier.leftValue).toBe('pokemon.frequency');
      expect(modifier.operation).toBe('*');
      expect(modifier.rightValue).toBe(0.9);

      expect(modifier.conditions).toHaveLength(1);
      const condition = modifier.conditions?.[0];
      expect(condition).toBeDefined();

      // Check that it's a target condition (not external)
      if (condition && 'leftValue' in condition) {
        expect(condition.leftValue).toBe('pokemon.specialty');
        expect(condition.operation).toBe('=');
        expect(condition.rightValue).toBe('berry');
      } else {
        throw new Error('Expected target condition with leftValue path property');
      }
    });

    it('should infer the correct type for value from the path', () => {
      // valid case
      const modifier: Modifier<PokemonInstance> = {
        type: 'PokemonInstanceDto',
        leftValue: 'pokemon.frequency',
        operation: '*',
        rightValue: 0.9
      };

      expect(modifier.type).toBe('PokemonInstanceDto');
      expect(modifier.leftValue).toBe('pokemon.frequency');
      expect(modifier.operation).toBe('*');
      expect(modifier.rightValue).toBe(0.9);

      // invalid case - wrong value type
      // @ts-expect-error - invalid type, should be number
      const invalidModifier: Modifier<PokemonInstance> = {
        type: 'PokemonInstanceDto',
        leftValue: 'pokemon.frequency',
        operation: '*',
        rightValue: '0.9'
      };

      expect(invalidModifier.leftValue).toBe('pokemon.frequency');
    });

    it('should infer the correct paths', () => {
      // valid case
      const modifier: Modifier<PokemonInstance> = {
        type: 'PokemonInstanceDto',
        leftValue: 'pokemon.frequency',
        operation: '*',
        rightValue: 0.9
      };

      expect(modifier.type).toBe('PokemonInstanceDto');
      expect(modifier.leftValue).toBe('pokemon.frequency');
      expect(modifier.operation).toBe('*');
      expect(modifier.rightValue).toBe(0.9);

      // invalid case
      const invalidModifier: Modifier<PokemonInstance> = {
        type: 'PokemonInstanceDto',
        // @ts-expect-error - invalid leftValue
        leftValue: 'invalid',
        operation: '*',
        rightValue: 0.9
      };

      expect(invalidModifier.rightValue).toBe(0.9);
    });
  });
});
