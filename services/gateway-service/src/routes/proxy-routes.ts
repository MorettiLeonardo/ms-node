import type { FastifyInstance, FastifyReply } from 'fastify';
import fastifyHttpProxy from '@fastify/http-proxy';
import { env } from '@src/config/index.js';
import { logger } from '@src/utils/index.js';

export async function register_proxy_routes(app: FastifyInstance): Promise<void> {
  const handle_proxy_error = (reply: FastifyReply, { error }: { error: Error }): void => {
    logger.error('Upstream proxy connection error', { error: error.message });
    reply.status(502).send({
      status: 'error',
      message: 'Bad Gateway: Upstream service unavailable'
    });
  };

  await app.register(fastifyHttpProxy, {
    upstream: env.AUTH_SERVICE_URL,
    prefix: '/api/v1/auth',
    rewritePrefix: '',
    replyOptions: {
      onError: handle_proxy_error
    }
  });

  await app.register(fastifyHttpProxy, {
    upstream: env.AUTH_SERVICE_URL,
    prefix: '/auth',
    rewritePrefix: '',
    replyOptions: {
      onError: handle_proxy_error
    }
  });

  await app.register(fastifyHttpProxy, {
    upstream: env.USER_SERVICE_URL,
    prefix: '/api/v1/users',
    rewritePrefix: '/api/v1/users',
    replyOptions: {
      onError: handle_proxy_error
    }
  });

  await app.register(fastifyHttpProxy, {
    upstream: env.USER_SERVICE_URL,
    prefix: '/users',
    rewritePrefix: '/api/v1/users',
    replyOptions: {
      onError: handle_proxy_error
    }
  });
}
