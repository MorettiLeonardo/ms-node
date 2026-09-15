import Fastify from 'fastify';
import type { FastifyInstance, FastifyError } from 'fastify';
import { randomUUID } from 'node:crypto';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import { env } from '@src/config/index.js';
import { logger } from '@src/utils/index.js';
import { AppError } from '@src/errors/index.js';
import { HealthController } from '@src/controllers/index.js';
import { HealthRouter, register_proxy_routes } from '@src/routes/index.js';

export async function build_app(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false
  });

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false
  });

  let cors_origin: boolean | string = true;
  if (env.CORS_ORIGIN !== '*') {
    cors_origin = env.CORS_ORIGIN;
  }

  await app.register(fastifyCors, {
    origin: cors_origin,
    credentials: true
  });

  app.addHook('onRequest', async (req, reply) => {
    const raw_request_id = req.headers['x-request-id'];
    let request_id = '';
    if (typeof raw_request_id === 'string' && raw_request_id.length > 0) {
      request_id = raw_request_id;
    } else {
      request_id = randomUUID();
    }

    reply.header('x-request-id', request_id);
    req.headers['x-request-id'] = request_id;

    logger.http('Incoming request', {
      request_id,
      method: req.method,
      url: req.url,
      ip: req.ip
    });
  });

  app.addHook('onResponse', async (req, reply) => {
    const request_id = reply.getHeader('x-request-id');
    const response_time = reply.elapsedTime;

    logger.http('Request completed', {
      request_id,
      method: req.method,
      url: req.url,
      status: reply.statusCode,
      duration_ms: Math.round(response_time)
    });
  });

  const health_controller = new HealthController(logger);
  const health_router = new HealthRouter(health_controller);

  await health_router.register(app);
  await register_proxy_routes(app);

  app.setNotFoundHandler((req, reply) => {
    reply.status(404).send({
      status: 'error',
      message: `Route ${req.method} ${req.url} not found on Gateway`
    });
  });

  app.setErrorHandler((error: FastifyError, req, reply) => {
    logger.error('Unhandled gateway error', {
      error,
      path: req.url,
      method: req.method
    });

    if (error instanceof AppError) {
      reply.status(error.status_code).send({
        status: 'error',
        message: error.message
      });
      return;
    }

    if (error.statusCode && error.statusCode < 500) {
      reply.status(error.statusCode).send({
        status: 'error',
        message: error.message
      });
      return;
    }

    reply.status(500).send({
      status: 'error',
      message: 'Internal Gateway Error'
    });
  });

  return app;
}
