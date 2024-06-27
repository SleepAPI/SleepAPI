import { PokemonInstance } from '../../../api/pokemon/pokemon-instance';

export interface TeamSettingsRequest {
  camp: boolean;
  bedtime: string;
  wakeup: string;
}
export interface PokemonInstanceIdentity extends PokemonInstance {
  externalId?: string;
}
export interface CalculateTeamRequest {
  settings: TeamSettingsRequest;
  members: PokemonInstanceIdentity[];
}

// TODO: fix
export interface CalculateTeamResponse {
  members: { berries: string; ingredients: string; skillProcs: number; externalId?: string }[];
}
