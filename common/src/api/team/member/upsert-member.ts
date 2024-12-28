import type { PokemonInstanceWithMeta } from '../../pokemon';

export type UpsertTeamMemberRequest = PokemonInstanceWithMeta;

export interface UpsertTeamMemberResponse extends PokemonInstanceWithMeta {
  memberIndex: number;
}
