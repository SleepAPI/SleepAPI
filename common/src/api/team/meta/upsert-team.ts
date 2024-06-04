export interface UpsertTeamMetaRequest {
  name: string;
  camp: boolean;
}

export interface UpsertTeamMetaResponse {
  index: number;
  name: string;
  camp: boolean;
  version: number;
}
