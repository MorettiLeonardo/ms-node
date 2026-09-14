import type { Request, Response, NextFunction } from 'express';

export class LoggingMiddleware {
  static handle(req: Request, res: Response, next: NextFunction): void {
    const start_time = Date.now();
    const { method, originalUrl } = req;

    res.on('finish', () => {
      const duration_ms = Date.now() - start_time;
      const { statusCode } = res;
      const log_message = `[${new Date().toISOString()}] ${method} ${originalUrl} ${statusCode} - ${duration_ms}ms`;

      if (statusCode >= 500) {
        process.stderr.write(`${log_message}\n`);
      } else {
        process.stdout.write(`${log_message}\n`);
      }
    });

    next();
  }
}
