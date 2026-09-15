import type { FastifySchema } from 'fastify';

export const register_route_schema: FastifySchema = {
  tags: ['Auth'],
  summary: 'Register a new account',
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
      role: { type: 'string', default: 'user' }
    }
  },
  response: {
    201: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            account: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
                is_active: { type: 'boolean' },
                created_at: { type: 'string' }
              }
            },
            tokens: {
              type: 'object',
              properties: {
                access_token: { type: 'string' },
                refresh_token: { type: 'string' },
                expires_in: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }
};

export const login_route_schema: FastifySchema = {
  tags: ['Auth'],
  summary: 'Authenticate and obtain tokens',
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            account: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
                is_active: { type: 'boolean' },
                created_at: { type: 'string' }
              }
            },
            tokens: {
              type: 'object',
              properties: {
                access_token: { type: 'string' },
                refresh_token: { type: 'string' },
                expires_in: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }
};

export const refresh_route_schema: FastifySchema = {
  tags: ['Auth'],
  summary: 'Refresh access token using refresh token',
  body: {
    type: 'object',
    required: ['refresh_token'],
    properties: {
      refresh_token: { type: 'string' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            access_token: { type: 'string' },
            refresh_token: { type: 'string' },
            expires_in: { type: 'number' }
          }
        }
      }
    }
  }
};

export const logout_route_schema: FastifySchema = {
  tags: ['Auth'],
  summary: 'Revoke refresh tokens and logout',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    properties: {
      refresh_token: { type: 'string' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        message: { type: 'string' }
      }
    }
  }
};

export const me_route_schema: FastifySchema = {
  tags: ['Auth'],
  summary: 'Get authenticated account profile',
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            is_active: { type: 'boolean' },
            created_at: { type: 'string' }
          }
        }
      }
    }
  }
};
