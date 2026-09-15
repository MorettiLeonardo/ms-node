import type { FastifyRequest, FastifyReply } from 'fastify';

export interface IAuthController {
  register(req: FastifyRequest, reply: FastifyReply): Promise<void>;
  login(req: FastifyRequest, reply: FastifyReply): Promise<void>;
  refresh(req: FastifyRequest, reply: FastifyReply): Promise<void>;
  logout(req: FastifyRequest, reply: FastifyReply): Promise<void>;
  me(req: FastifyRequest, reply: FastifyReply): Promise<void>;
}

export interface IHealthController {
  check(req: FastifyRequest, reply: FastifyReply): Promise<void>;
}

export type {
  SuccessResponse,
  MessageResponse,
  AuthSessionResponse,
  AuthTokensResponse,
  AccountProfileResponse
} from '@src/types/services/index.js';
