export interface UpsertTeamMetaRequest {
  name: string;
  camp: boolean;
  bedtime: string;
  wakeup: string;
}

export interface UpsertTeamMetaResponse {
  index: number;
  name: string;
  camp: boolean;
  bedtime: string;
  wakeup: string;
  version: number;
}
