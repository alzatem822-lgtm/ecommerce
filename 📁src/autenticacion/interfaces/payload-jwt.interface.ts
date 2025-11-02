export interface PayloadJwt {
  email: string;
  sub: string;
  rol: string;
  iat?: number;
  exp?: number;
}