import type { User } from '@prisma/client';
import type { ResultTuple } from '@src/types/shared/index.js';

export interface CreateUserParams {
  email: string;
  name: string;
  role?: string;
}

export interface UpdateUserParams {
  user_id: string;
  email?: string;
  name?: string;
  role?: string;
}

export interface FindOneUserParams {
  user_id: string;
}

export interface FindAllUsersParams {
  page?: number;
  limit?: number;
}

export interface UserResponse {
  user: User;
  is_from_cache: boolean;
}

export interface PaginatedUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface IUserService {
  create(params: CreateUserParams): Promise<ResultTuple<User>>;
  findOne(params: FindOneUserParams): Promise<ResultTuple<UserResponse>>;
  findAll(params: FindAllUsersParams): Promise<ResultTuple<PaginatedUsersResponse>>;
  update(params: UpdateUserParams): Promise<ResultTuple<User>>;
  remove(params: FindOneUserParams): Promise<ResultTuple<boolean>>;
}
