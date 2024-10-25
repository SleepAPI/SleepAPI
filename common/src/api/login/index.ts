export interface LoginResponse {
  name: string;
  avatar?: string;
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  email: string;
  externalId: string;
}

export interface RefreshResponse {
  access_token: string;
  expiry_date: number;
}
