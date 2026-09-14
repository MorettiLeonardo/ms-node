import express, { type Application, type Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '@src/config/index.js';
import { LoggingMiddleware, ErrorMiddleware } from '@src/middlewares/index.js';
import { AppError } from '@src/errors/index.js';

export class App {
  public readonly app: Application;

  constructor(
    private readonly health_router: Router,
    private readonly user_router: Router
  ) {
    this.app = express();
    this.setup_middlewares();
    this.setup_routes();
    this.setup_error_handling();
  }

  private setup_middlewares(): void {
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: env.CORS_ORIGIN,
        credentials: true
      })
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(LoggingMiddleware.handle);
  }

  private setup_routes(): void {
    this.app.use('/health', this.health_router);
    this.app.use('/api/v1/users', this.user_router);
  }

  private setup_error_handling(): void {
    this.app.use((req, _res, next) => {
      next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`));
    });

    this.app.use(ErrorMiddleware.handle);
  }
}
