import type { PathKeys, PathValue } from '../type';
import type { PathReference } from './path-reference';
import type { ModifierTargetType, ModifierTargetTypeDTO, TargetTypeMap } from './target-types';

// ============================================
// Core Modifier Types (Internal)
// ============================================

export type ModifierOperation = '*' | '+' | '-' | '/' | '=';
export type ConditionOperation = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not-in';

export type ModifierComplexValue<T extends ModifierTargetType, P extends PathKeys<T>> = {
  rightValue: PathValue<T, P> | PathReference<T>;
  /**
   * If min is provided, the modifier will be at least the min value
   */
  min?: PathValue<T, P> | PathReference<T>;
  /**
   * If max is provided, the modifier will be capped at the max value
   */
  max?: PathValue<T, P> | PathReference<T>;
};

/**
 * Modifier value supports simple values, PathReferences, or constrained operations
 *
 * @example
 * // Simple value
 * 5
 *
 * @example
 * // PathReference to another property
 * PathReference.to('pokemon.skill.maxLevel')
 *
 * @example
 * // Constrained operation (operation comes from top-level modifier)
 * {
 *   rightValue: 3,
 *   max: PathReference.to('pokemon.skill.maxLevel')
 * }
 *
 * @example
 * // Subtract with floor constraint
 * {
 *   rightValue: 1000,
 *   min: 500
 * }
 *
 * @example
 * // Multiply with both min and max constraints
 * {
 *   rightValue: 1.5,
 *   min: 100,
 *   max: 5000
 * }
 */
export type ModifierValue<T extends ModifierTargetType, P extends PathKeys<T>> =
  PathValue<T, P> | PathReference<T> | ModifierComplexValue<T, P>;

/**
 * Modifier options that define how to modify a target object
 * Uses consistent leftValue/rightValue naming for clarity:
 * - leftValue: what gets modified (the target path)
 * - operation: how it gets modified
 * - rightValue: what it gets modified by/to
 * - conditions: when the modifier should apply
 */
export type ModifierOptions<T extends ModifierTargetType> = {
  [P in PathKeys<T>]: {
    type: ModifierTargetTypeDTO;
    leftValue: P;
    operation: ModifierOperation;
    rightValue: ModifierValue<T, P>;
    conditions?: Condition<T>[];
  };
};

/**
 * Target condition that checks properties on the target object (Pokemon/PokemonInstance)
 * Uses consistent leftValue/rightValue naming for clarity:
 * - leftValue: what gets checked (the target path)
 * - operation: how it gets compared
 * - rightValue: what it gets compared against
 *
 * RightValue can be either:
 * - A literal value of the expected type
 * - A PathReference to another path on the same object (e.g., PathReference.to('maxSkillLevel'))
 */
type TargetConditionOptions<T extends ModifierTargetType> = {
  [P in PathKeys<T>]: {
    leftValue: P;
    operation: ConditionOperation;
    rightValue: PathValue<T, P> | PathValue<T, P>[] | PathReference<T>;
  };
};

/**
 * External condition that checks external values (input, imports, etc.)
 * Uses consistent leftValue/rightValue naming for clarity:
 * - leftValue: what gets checked (the external value)
 * - operation: how it gets compared
 * - rightValue: what it gets compared against
 * Provides type safety for the value being checked
 */
export type ExternalCondition<TValue = unknown> = {
  leftValue: TValue;
  operation: ConditionOperation;
  rightValue: TValue | TValue[];
};

/**
 * Type-safe modifier interface with optional conditions
 * Uses distributive conditional types to handle union types correctly
 *
 * @example
 * // Modifier that reduces frequency by 10% only for not-fully-evolved Pokemon
 * const modifier: Modifier<Pokemon> = {
 *   type: 'Pokemon',
 *   path: 'frequency',
 *   operation: '*',
 *   value: 0.9,
 *   condition: {
 *     path: 'remainingEvolutions',
 *     operation: '>',
 *     value: '0'
 *   }
 * };
 */
export type Modifier<TargetType extends ModifierTargetType> = TargetType extends unknown
  ? ModifierOptions<TargetType>[PathKeys<TargetType>]
  : never;
export type ModifierDTO<TargetType extends ModifierTargetTypeDTO = ModifierTargetTypeDTO> = {
  type: TargetType;
  modifiers: Modifier<TargetTypeMap[TargetType]>[];
};
export type TargetCondition<T extends ModifierTargetType> = TargetConditionOptions<T>[PathKeys<T>];
export type Condition<T extends ModifierTargetType> = TargetCondition<T> | ExternalCondition;
