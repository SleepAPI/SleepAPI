export interface PutTeamRequest {
  name: string;
  camp: boolean;
}

export interface PutTeamResponse {
  index: number;
  name: string;
  camp: boolean;
}
