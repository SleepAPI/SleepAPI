export interface DecodedUserData {
  sub: string;
  email: string;
  given_name: string;
  picture: string;
}

export interface LoginResponse {
  id_token: string;
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

export interface RefreshResponse {
  access_token: string;
  expiry_date: number;
}
