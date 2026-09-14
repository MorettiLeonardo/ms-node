import type { Server as HttpServer } from 'node:http';
import { env, prismaService, cacheService, redis } from '@src/config/index.js';
import { UserRepository } from '@src/repositories/index.js';
import { UserService } from '@src/services/index.js';
import { UserController, HealthController } from '@src/controllers/index.js';
import { UserMiddleware } from '@src/middlewares/index.js';
import { UserRouter, HealthRouter } from '@src/routes/index.js';
import { App } from '@src/app.js';

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

      const application = new App(health_router.router, user_router.router);

      this.http_server = application.app.listen(env.PORT, () => {
        process.stdout.write(`User Service running on port ${env.PORT}\n`);
      });
    } catch (error) {
      process.stderr.write(`Fatal error during service bootstrap: ${String(error)}\n`);
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
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
