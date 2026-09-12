import { describe, expect, it } from 'vitest';
import { pokemonInstance } from '../../vitest/mocks';
import { memberStrength } from '../../vitest/mocks/events/mock-member-strength';
import type { ModifierTargetType, ModifierTargetTypeDTO, TargetTypeMap } from './target-types';

describe('TargetTypeMap', () => {
  it('should map the correct type', () => {
    const monInstance: TargetTypeMap['PokemonInstanceDto'] = pokemonInstance();

    // @ts-expect-error - invalid property, asserts that we indeed get a type-safe Pokemon object
    monInstance.invalid;

    // Check that we get a proper Pokemon object with expected properties
    expect(typeof monInstance).toBe('object');
    expect(typeof monInstance.name).toBe('string');
    expect(typeof monInstance.pokemon.displayName).toBe('string');
    expect(typeof monInstance.pokemon.pokedexNumber).toBe('number');
    expect(typeof monInstance.pokemon.specialty).toBe('string');
    expect(typeof monInstance.pokemon.frequency).toBe('number');
  });
});

describe('ModifierTargetType', () => {
  it('should be a union of all target types', () => {
    const monInstance: ModifierTargetType = pokemonInstance();
    const strength: ModifierTargetType = memberStrength();

    // @ts-expect-error - invalid property, asserts that we indeed get a type-safe PokemonInstance object
    monInstance.invalid;
    // @ts-expect-error - invalid property, asserts that we indeed get a type-safe MemberStrength object
    strength.invalid;

    // @ts-expect-error - invalid target type
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const invalid: ModifierTargetType = 'not a valid target type';

    expect(typeof monInstance).toBe('object');
    expect(typeof strength).toBe('object');
  });
});

describe('ModifierTargetTypeDTO', () => {
  it('should be a union of all target types', () => {
    const pokemonInstance: ModifierTargetTypeDTO = 'PokemonInstanceDto';
    const memberStrength: ModifierTargetTypeDTO = 'MemberStrengthDto';

    // @ts-expect-error - invalid target type
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const invalid: ModifierTargetTypeDTO = 'not a valid target type';

    expect(pokemonInstance).toBe('PokemonInstanceDto');
    expect(memberStrength).toBe('MemberStrengthDto');
  });
});
