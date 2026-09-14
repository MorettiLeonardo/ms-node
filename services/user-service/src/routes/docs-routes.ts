import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { SWAGGER_SPEC } from '@src/docs/index.js';

export class DocsRouter {
  public readonly router: Router;

  constructor() {
    this.router = Router();
    this.register_routes();
  }

  private register_routes(): void {
    this.router.get('/swagger.json', (_req, res) => {
      res.status(200).json(SWAGGER_SPEC);
    });

    this.router.use('/', swaggerUi.serve, swaggerUi.setup(SWAGGER_SPEC));
  }
}
