import { logger } from '@src/utils/index.js';

import type { Prisma, PrismaClient, User } from '@prisma/client';
import * as T from '@src/types/repositories/index.js';
import type { ResultTuple, ILogger } from '@src/types/shared/index.js';

export class UserRepository implements T.IUserRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly logger_service: ILogger = logger
  ) { }

  async create(
    payload: T.CreateUserPayload,
    options?: { transaction?: Prisma.TransactionClient }
  ): Promise<ResultTuple<User>> {
    const client = options?.transaction ?? this.prisma;
    try {
      this.logger_service.info('init', { method: 'create', payload });
      const user = await client.user.create({
        data: {
          email: payload.email,
          name: payload.name,
          role: payload.role ?? 'USER'
        }
      });
      const result: ResultTuple<User> = [user, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'create', error, payload });
      const result: ResultTuple<User> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'create' });
    }
  }

  async findById(params: { user_id: string }): Promise<ResultTuple<User>> {
    try {
      this.logger_service.info('init', { method: 'findById', params });
      const user = await this.prisma.user.findUnique({
        where: { id: params.user_id }
      });
      const result: ResultTuple<User> = [user, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'findById', error, params });
      const result: ResultTuple<User> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'findById' });
    }
  }

  async findByEmail(params: { email: string }): Promise<ResultTuple<User>> {
    try {
      this.logger_service.info('init', { method: 'findByEmail', params });
      const user = await this.prisma.user.findUnique({
        where: { email: params.email }
      });
      const result: ResultTuple<User> = [user, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'findByEmail', error, params });
      const result: ResultTuple<User> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'findByEmail' });
    }
  }

  async findMany(params: { skip: number; take: number }): Promise<ResultTuple<User[]>> {
    try {
      this.logger_service.info('init', { method: 'findMany', params });
      const users = await this.prisma.user.findMany({
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' }
      });
      const result: ResultTuple<User[]> = [users, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'findMany', error, params });
      const result: ResultTuple<User[]> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'findMany' });
    }
  }

  async update(
    params: { user_id: string; payload: T.UpdateUserPayload },
    options?: { transaction?: Prisma.TransactionClient }
  ): Promise<ResultTuple<User>> {
    const client = options?.transaction ?? this.prisma;
    try {
      this.logger_service.info('init', { method: 'update', params });
      const user = await client.user.update({
        where: { id: params.user_id },
        data: params.payload
      });
      const result: ResultTuple<User> = [user, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'update', error, params });
      const result: ResultTuple<User> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'update' });
    }
  }

  async delete(
    params: { user_id: string },
    options?: { transaction?: Prisma.TransactionClient }
  ): Promise<ResultTuple<User>> {
    const client = options?.transaction ?? this.prisma;
    try {
      this.logger_service.info('init', { method: 'delete', params });
      const user = await client.user.delete({
        where: { id: params.user_id }
      });
      const result: ResultTuple<User> = [user, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'delete', error, params });
      const result: ResultTuple<User> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'delete' });
    }
  }

  async count(): Promise<ResultTuple<number>> {
    try {
      this.logger_service.info('init', { method: 'count' });
      const total = await this.prisma.user.count();
      const result: ResultTuple<number> = [total, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'count', error });
      const result: ResultTuple<number> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'count' });
    }
  }
}
