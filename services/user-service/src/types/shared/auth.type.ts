export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

export interface JwtUserPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
