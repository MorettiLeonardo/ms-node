import type { Request, Response, NextFunction } from 'express';
import { logger } from '@src/utils/index.js';

export class LoggingMiddleware {
  static handle(req: Request, res: Response, next: NextFunction): void {
    const start_time = Date.now();
    const { method, originalUrl } = req;

    res.on('finish', () => {
      const duration_ms = Date.now() - start_time;
      const { statusCode } = res;
      const message = `${method} ${originalUrl} ${statusCode} - ${duration_ms}ms`;
      const context = { method, url: originalUrl, statusCode, duration_ms };

      if (statusCode >= 500) {
        logger.error(message, context);
        return;
      }

      logger.http(message, context);
    });

    next();
  }
}
