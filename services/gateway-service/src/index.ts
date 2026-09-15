import { build_app } from '@src/app.js';
import { env } from '@src/config/index.js';
import { logger } from '@src/utils/index.js';

async function bootstrap(): Promise<void> {
  const app = await build_app();

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}. Shutting down gateway gracefully...`);
    try {
      await app.close();
      logger.info('Gateway server shut down gracefully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during gateway graceful shutdown', { error });
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  try {
    await app.listen({
      port: env.PORT,
      host: '0.0.0.0'
    });
    logger.info(`API Gateway running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    logger.info(`Proxying Auth: ${env.AUTH_SERVICE_URL} (/api/v1/auth, /auth)`);
    logger.info(`Proxying Users: ${env.USER_SERVICE_URL} (/api/v1/users, /users)`);
  } catch (error) {
    logger.error('Failed to start API Gateway', { error });
    process.exit(1);
  }
}

void bootstrap();
