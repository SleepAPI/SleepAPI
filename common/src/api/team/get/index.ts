import { PokemonInstance } from '../../pokemon/pokemon-instance';

export interface GetTeamResponse {
  index: number;
  name: string;
  camp: boolean;
  version: number;

  members: PokemonInstance[];
}

export interface GetTeamsResponse {
  teams: GetTeamResponse[];
}
