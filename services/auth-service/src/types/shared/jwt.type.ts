export interface JwtTokenPayload {
  sub: string;
  email: string;
  role: string;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtTokenPayload;
    user: JwtTokenPayload;
  }
}
