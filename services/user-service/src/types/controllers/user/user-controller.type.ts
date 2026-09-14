import type { Request, Response, NextFunction } from 'express';

export interface IUserController {
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  findOne(req: Request, res: Response, next: NextFunction): Promise<void>;
  findAll(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  remove(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export interface IHealthController {
  check(req: Request, res: Response, next: NextFunction): Promise<void>;
}
