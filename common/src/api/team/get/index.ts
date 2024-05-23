export interface GetTeamResponse {
  index: number;
  name: string;
  camp: boolean;

  // TODO: add pokemon
}

export interface GetTeamsResponse {
  teams: GetTeamResponse[];
}
