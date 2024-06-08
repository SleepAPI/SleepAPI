import { PokemonInstance } from '../../pokemon';

export interface UpsertTeamMemberRequest extends PokemonInstance {}

export interface UpsertTeamMemberResponse extends PokemonInstance {
  memberIndex: number;
}
