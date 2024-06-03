import { InstancedPokemon } from '../../pokemon/instanced-pokemon';

export interface GetTeamResponse {
  index: number;
  name: string;
  camp: boolean;
  version: number;

  members: InstancedPokemon[];
}

export interface GetTeamsResponse {
  teams: GetTeamResponse[];
}
