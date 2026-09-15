import Fastify from 'fastify';
import type { FastifyInstance, FastifyError } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { env, prisma } from '@src/config/index.js';
import { logger } from '@src/utils/index.js';
import { AppError } from '@src/errors/index.js';
import { ACCESS_TOKEN_EXPIRES_IN_SECONDS } from '@src/constants/index.js';
import { AuthRepository } from '@src/repositories/index.js';
import { AuthService } from '@src/services/index.js';
import { AuthMiddleware } from '@src/middlewares/index.js';
import { AuthController, HealthController } from '@src/controllers/index.js';
import { AuthRouter, HealthRouter } from '@src/routes/index.js';

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
    origin: cors_origin
  });

  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET
  });

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'LearnS Auth Microservice API',
        description: 'Authentication microservice with Fastify, TypeScript, and MySQL',
        version: '1.0.0'
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Auth Service server'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    }
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    }
  });

  app.setErrorHandler((error: FastifyError, req, reply) => {
    logger.error('Unhandled request error', {
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
      message: 'Internal server error'
    });
  });

  const jwt_sign = (payload: { sub: string; email: string; role: string }): string => {
    const token = app.jwt.sign(payload, { expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS });
    return token;
  };

  const auth_repository = new AuthRepository(prisma, logger);
  const auth_service = new AuthService(prisma, auth_repository, jwt_sign, logger);
  const auth_middleware = new AuthMiddleware(auth_repository, logger);
  const auth_controller = new AuthController(auth_service, logger);
  const health_controller = new HealthController(logger);

  const auth_router = new AuthRouter(auth_controller, auth_middleware);
  const health_router = new HealthRouter(health_controller);

  await auth_router.register(app);
  await health_router.register(app);

  return app;
}
