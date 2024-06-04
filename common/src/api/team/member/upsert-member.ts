import { PokemonInstance, PokemonTemplate } from '../../pokemon';

export interface UpsertTeamMemberRequest extends PokemonTemplate {
  externalId?: string;
}

export interface UpsertTeamMemberResponse extends PokemonInstance {}
