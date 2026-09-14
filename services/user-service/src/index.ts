import type { Server as HttpServer } from 'node:http';
import { env, prismaService, cacheService, redis } from '@src/config/index.js';
import { UserRepository } from '@src/repositories/index.js';
import { UserService } from '@src/services/index.js';
import { UserController, HealthController } from '@src/controllers/index.js';
import { UserMiddleware } from '@src/middlewares/index.js';
import { UserRouter, HealthRouter, DocsRouter } from '@src/routes/index.js';
import { App } from '@src/app.js';
import { logger } from '@src/utils/index.js';

export class Server {
  private http_server: HttpServer | null = null;

  async start(): Promise<void> {
    try {
      await prismaService.connect();
      await cacheService.connect();

      const user_repository = new UserRepository(prismaService.client);
      const user_service = new UserService(prismaService.client, user_repository, cacheService);
      const user_middleware = new UserMiddleware(user_repository);
      const user_controller = new UserController(user_service);
      const health_controller = new HealthController(prismaService.client, redis);

      const user_router = new UserRouter(user_controller, user_middleware);
      const health_router = new HealthRouter(health_controller);
      const docs_router = new DocsRouter();

      const application = new App(health_router.router, user_router.router, docs_router.router);

      this.http_server = application.app.listen(env.PORT, () => {
        logger.info(`User Service running on port ${env.PORT}`, { port: env.PORT, env: env.NODE_ENV });
      });
    } catch (error) {
      logger.error(`Fatal error during service bootstrap: ${String(error)}`, { error });
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    logger.info('Gracefully shutting down User Service...');

    if (this.http_server) {
      await new Promise<void>((resolve) => {
        this.http_server?.close(() => {
          resolve();
        });
      });
    }

    await prismaService.disconnect();
    await cacheService.disconnect();

    process.exit(0);
  }
}

const server = new Server();

process.on('SIGTERM', () => void server.stop());
process.on('SIGINT', () => void server.stop());

void server.start();
