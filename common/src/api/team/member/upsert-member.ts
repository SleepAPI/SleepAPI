import { PokemonInstanceWithMeta } from '../../pokemon';

export interface UpsertTeamMemberRequest extends PokemonInstanceWithMeta {}

export interface UpsertTeamMemberResponse extends PokemonInstanceWithMeta {
  memberIndex: number;
}
