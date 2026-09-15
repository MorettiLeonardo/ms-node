import { AuthSchema } from '@src/schemas/index.js';
import {
  register_route_schema,
  login_route_schema,
  refresh_route_schema,
  logout_route_schema,
  me_route_schema
} from '@src/routes/auth-route-schemas.js';

import type { FastifyInstance } from 'fastify';
import type { AuthMiddleware } from '@src/middlewares/index.js';
import type { IAuthController } from '@src/types/controllers/index.js';

export class AuthRouter {
  constructor(
    private readonly controller: IAuthController,
    private readonly middleware: AuthMiddleware
  ) {
    this.register = this.register.bind(this);
  }

  async register(fastify: FastifyInstance): Promise<void> {
    fastify.post(
      '/register',
      {
        schema: register_route_schema,
        preValidation: [AuthSchema.register],
        preHandler: [this.middleware.validate_unique_email]
      },
      this.controller.register
    );

    fastify.post(
      '/login',
      {
        schema: login_route_schema,
        preValidation: [AuthSchema.login]
      },
      this.controller.login
    );

    fastify.post(
      '/refresh',
      {
        schema: refresh_route_schema,
        preValidation: [AuthSchema.refresh]
      },
      this.controller.refresh
    );

    fastify.post(
      '/logout',
      {
        schema: logout_route_schema,
        preValidation: [AuthSchema.logout],
        preHandler: [this.middleware.authenticate]
      },
      this.controller.logout
    );

    fastify.get(
      '/me',
      {
        schema: me_route_schema,
        preHandler: [this.middleware.authenticate, this.middleware.validate_account_active]
      },
      this.controller.me
    );
  }
}
