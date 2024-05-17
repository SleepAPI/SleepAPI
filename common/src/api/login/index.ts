export interface DecodedUserData {
  sub: string;
  email: string;
  given_name: string;
  picture: string;
}

export interface LoginResponse {
  idToken: string;
  accessToken: string;
  expiryDate: number;
  deviceId: string;
}

export interface RefreshResponse {
  accessToken: string;
  expiryDate: number;
}
