import type { PrismaClient, User } from '@prisma/client';
import { AppError } from '@src/errors/index.js';
import { USER_CACHE_PREFIX, DEFAULT_PAGE, DEFAULT_LIMIT } from '@src/constants/index.js';
import type { IUserRepository } from '@src/types/repositories/index.js';
import type { ICacheService } from '@src/types/cache/index.js';
import type {
  IUserService,
  CreateUserParams,
  UpdateUserParams,
  FindOneUserParams,
  FindAllUsersParams,
  UserResponse,
  PaginatedUsersResponse
} from '@src/types/services/index.js';
import type { ResultTuple } from '@src/types/shared/index.js';

export class UserService implements IUserService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly user_repository: IUserRepository,
    private readonly cache_service: ICacheService
  ) {}

  async create(params: CreateUserParams): Promise<ResultTuple<User>> {
    try {
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
      const result: ResultTuple<User> = [null, error as Error];
      return result;
    }
  }

  async findOne(params: FindOneUserParams): Promise<ResultTuple<UserResponse>> {
    const cache_key = `${USER_CACHE_PREFIX}${params.user_id}`;
    const [cached_user, err_cached] = await this.cache_service.get<User>(cache_key);

    if (cached_user && !err_cached) {
      const result: ResultTuple<UserResponse> = [{ user: cached_user, is_from_cache: true }, null];
      return result;
    }

    const [db_user, err_db] = await this.user_repository.findById({ user_id: params.user_id });

    if (err_db) {
      const result: ResultTuple<UserResponse> = [null, err_db];
      return result;
    }

    if (!db_user) {
      const result: ResultTuple<UserResponse> = [null, new AppError(404, `User with ID "${params.user_id}" not found`)];
      return result;
    }

    await this.cache_service.set(cache_key, db_user);

    const result: ResultTuple<UserResponse> = [{ user: db_user, is_from_cache: false }, null];
    return result;
  }

  async findAll(params: FindAllUsersParams): Promise<ResultTuple<PaginatedUsersResponse>> {
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
      const result: ResultTuple<PaginatedUsersResponse> = [null, err_users];
      return result;
    }

    const [total, err_total] = await this.user_repository.count();
    if (err_total) {
      const result: ResultTuple<PaginatedUsersResponse> = [null, err_total];
      return result;
    }

    const paginated_data: PaginatedUsersResponse = {
      users: users ?? [],
      total: total ?? 0,
      page: page_number,
      limit: limit_number
    };

    const result: ResultTuple<PaginatedUsersResponse> = [paginated_data, null];
    return result;
  }

  async update(params: UpdateUserParams): Promise<ResultTuple<User>> {
    try {
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
      const result: ResultTuple<User> = [null, error as Error];
      return result;
    }
  }

  async remove(params: FindOneUserParams): Promise<ResultTuple<boolean>> {
    try {
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
      const result: ResultTuple<boolean> = [null, error as Error];
      return result;
    }
  }
}
