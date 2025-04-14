export interface AuthResponse {
  user: {
    firstname: string;
    lastname: string;
    email: string;
    role: string;
  };
  access_token: string;
  refresh_token: string;
  expiration_date: string;
}
