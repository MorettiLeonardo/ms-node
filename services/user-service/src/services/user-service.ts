import { AppError } from '@src/errors/index.js';
import { USER_CACHE_PREFIX, DEFAULT_PAGE, DEFAULT_LIMIT } from '@src/constants/index.js';
import { logger } from '@src/utils/index.js';

import type { PrismaClient, User } from '@prisma/client';
import type { IUserRepository } from '@src/types/repositories/index.js';
import type { ICacheService } from '@src/types/cache/index.js';
import * as T from '@src/types/services/index.js';
import type { ResultTuple, ILogger } from '@src/types/shared/index.js';

export class UserService implements T.IUserService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly user_repository: IUserRepository,
    private readonly cache_service: ICacheService,
    private readonly logger_service: ILogger = logger
  ) {}

  async create(params: T.CreateUserParams): Promise<ResultTuple<User>> {
    try {
      this.logger_service.info('init', { method: 'create', params });

      const user = await this.prisma.$transaction(async (tx) => {
        const payload = {
          email: params.email,
          name: params.name,
          role: params.role
        };
        const [created_user, error] = await this.user_repository.create(payload, { transaction: tx });
        if (error) {
          throw error;
        }
        return created_user;
      });

      const cache_key = `${USER_CACHE_PREFIX}${user.id}`;
      await this.cache_service.set(cache_key, user);

      const result: ResultTuple<User> = [user, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'create', error, params });
      const result: ResultTuple<User> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'create' });
    }
  }

  async findOne(params: T.FindOneUserParams): Promise<ResultTuple<T.UserResponse>> {
    try {
      this.logger_service.info('init', { method: 'findOne', params });

      const cache_key = `${USER_CACHE_PREFIX}${params.user_id}`;
      const [cached_user, err_cached] = await this.cache_service.get<User>(cache_key);

      if (cached_user && !err_cached) {
        this.logger_service.debug('User retrieved from cache', { user_id: params.user_id });
        const result: ResultTuple<T.UserResponse> = [{ user: cached_user, is_from_cache: true }, null];
        return result;
      }

      const [db_user, err_db] = await this.user_repository.findById({ user_id: params.user_id });

      if (err_db) {
        throw err_db;
      }

      if (!db_user) {
        const result: ResultTuple<T.UserResponse> = [
          null,
          new AppError(404, `User with ID "${params.user_id}" not found`)
        ];
        return result;
      }

      await this.cache_service.set(cache_key, db_user);

      const result: ResultTuple<T.UserResponse> = [{ user: db_user, is_from_cache: false }, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'findOne', error, params });
      const result: ResultTuple<T.UserResponse> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'findOne' });
    }
  }

  async findAll(params: T.FindAllUsersParams): Promise<ResultTuple<T.PaginatedUsersResponse>> {
    try {
      this.logger_service.info('init', { method: 'findAll', params });

      let page_number = DEFAULT_PAGE;
      if (params.page) {
        page_number = params.page;
      }

      let limit_number = DEFAULT_LIMIT;
      if (params.limit) {
        limit_number = params.limit;
      }

      const skip = (page_number - 1) * limit_number;

      const [users, err_users] = await this.user_repository.findMany({ skip, take: limit_number });
      if (err_users) {
        throw err_users;
      }

      const [total, err_total] = await this.user_repository.count();
      if (err_total) {
        throw err_total;
      }

      const paginated_data: T.PaginatedUsersResponse = {
        users: users ?? [],
        total: total ?? 0,
        page: page_number,
        limit: limit_number
      };

      const result: ResultTuple<T.PaginatedUsersResponse> = [paginated_data, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'findAll', error, params });
      const result: ResultTuple<T.PaginatedUsersResponse> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'findAll' });
    }
  }

  async update(params: T.UpdateUserParams): Promise<ResultTuple<User>> {
    try {
      this.logger_service.info('init', { method: 'update', params });

      const user = await this.prisma.$transaction(async (tx) => {
        const payload = {
          email: params.email,
          name: params.name,
          role: params.role
        };
        const [updated_user, error] = await this.user_repository.update(
          { user_id: params.user_id, payload },
          { transaction: tx }
        );
        if (error) {
          throw error;
        }
        return updated_user;
      });

      const cache_key = `${USER_CACHE_PREFIX}${params.user_id}`;
      await this.cache_service.set(cache_key, user);

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

  async remove(params: T.FindOneUserParams): Promise<ResultTuple<boolean>> {
    try {
      this.logger_service.info('init', { method: 'remove', params });

      await this.prisma.$transaction(async (tx) => {
        const [, error] = await this.user_repository.delete({ user_id: params.user_id }, { transaction: tx });
        if (error) {
          throw error;
        }
      });

      const cache_key = `${USER_CACHE_PREFIX}${params.user_id}`;
      await this.cache_service.del(cache_key);

      const result: ResultTuple<boolean> = [true, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'remove', error, params });
      const result: ResultTuple<boolean> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'remove' });
    }
  }
}
