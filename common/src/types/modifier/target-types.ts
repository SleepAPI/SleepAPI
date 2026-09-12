import type { PokemonInstance } from '../instance';
import type { MemberStrength, TeamMember } from '../team';

export type ModifierTargetTypeDTO = 'PokemonInstanceDto' | 'MemberStrengthDto' | 'TeamMemberDto';
export type ModifierTargetType = PokemonInstance | MemberStrength | TeamMember;

/**
 * Used for mapping API strings to actual types
 *
 * @tutorial How to add a new target type
 * 1. Add the string literal to ModifierTargetTypeDTO union above
 * 2. Add the actual type to ModifierTargetType union above
 * 3. Add the mapping entry here
 *
 * Example for adding a new "Item" type:
 * - ModifierTargetTypeDTO = 'PokemonDto' | 'PokemonInstanceDto' | 'ItemDto'
 * - ModifierTargetType = Pokemon | PokemonInstance | Item
 * - TargetTypeMap = { PokemonDto: Pokemon, PokemonInstanceDto: PokemonInstance, ItemDto: Item } *
 */
export type TargetTypeMap = {
  PokemonInstanceDto: PokemonInstance;
  MemberStrengthDto: MemberStrength;
  TeamMemberDto: TeamMember;
};
