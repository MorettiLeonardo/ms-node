import { build_app } from '@src/app.js';
import { env, prisma } from '@src/config/index.js';
import { logger } from '@src/utils/index.js';

async function bootstrap(): Promise<void> {
  const app = await build_app();

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    try {
      await app.close();
      await prisma.$disconnect();
      logger.info('Server shut down gracefully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown', { error });
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
    logger.info(`Auth service running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    logger.info(`Swagger UI available at http://localhost:${env.PORT}/docs`);
  } catch (error) {
    logger.error('Failed to start auth service', { error });
    await prisma.$disconnect();
    process.exit(1);
  }
}

void bootstrap();
