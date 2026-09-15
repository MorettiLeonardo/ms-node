import type { ResultTuple } from '@src/types/shared/index.js';

export interface RegisterParams {
  email: string;
  password: string;
  role?: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface RefreshParams {
  refresh_token: string;
}

export interface LogoutParams {
  account_id?: string;
  refresh_token?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AccountProfile {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: Date;
}

export interface AuthSession {
  account: AccountProfile;
  tokens: AuthTokens;
}

export interface IAuthService {
  register(params: RegisterParams): Promise<ResultTuple<AuthSession>>;
  login(params: LoginParams): Promise<ResultTuple<AuthSession>>;
  refresh(params: RefreshParams): Promise<ResultTuple<AuthTokens>>;
  logout(params: LogoutParams): Promise<ResultTuple<boolean>>;
  getProfile(account_id: string): Promise<ResultTuple<AccountProfile>>;
}

export interface RegisterBody {
  email: string;
  password: string;
  role?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface RefreshBody {
  refresh_token: string;
}

export interface LogoutBody {
  refresh_token?: string;
}

export interface SuccessResponse<T> {
  status: 'success';
  data: T;
}

export interface MessageResponse {
  status: 'success';
  message: string;
}

export type AuthSessionResponse = SuccessResponse<AuthSession>;
export type AuthTokensResponse = SuccessResponse<AuthTokens>;
export type AccountProfileResponse = SuccessResponse<AccountProfile>;

export type JwtSignFunction = (payload: { sub: string; email: string; role: string }) => string;
