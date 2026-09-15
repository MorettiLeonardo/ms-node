export const SWAGGER_SPEC: Record<string, unknown> = {
  openapi: '3.0.3',
  info: {
    title: 'Learns Platform - User Service API',
    version: '1.0.0',
    description:
      'Production-ready User Microservice built with Node.js, Express, TypeScript, Prisma (PostgreSQL), and Redis Cache.'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local Development Server'
    }
  ],
  tags: [
    {
      name: 'Health',
      description: 'System and dependency health check operations'
    },
    {
      name: 'Users',
      description: 'User management operations, caching, and persistence'
    }
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Check service health',
        description: 'Verifies PostgreSQL and Redis connectivity status',
        responses: {
          '200': {
            description: 'Service is completely healthy',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse'
                }
              }
            }
          },
          '503': {
            description: 'Service is degraded or disconnected from dependencies',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/users': {
      post: {
        security: [{ bearerAuth: [] }],
        tags: ['Users'],
        summary: 'Create user',
        description: 'Creates a new user record in PostgreSQL and warms the Redis cache',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateUserInput'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserResponse'
                }
              }
            }
          },
          '400': {
            description: 'Validation error (invalid email or missing name)',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '409': {
            description: 'Conflict - Email already registered',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      },
      get: {
        security: [{ bearerAuth: [] }],
        tags: ['Users'],
        summary: 'List users',
        description: 'Retrieves a paginated list of users',
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number (default: 1)',
            required: false,
            schema: {
              type: 'integer',
              minimum: 1,
              default: 1
            }
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Items per page (default: 10)',
            required: false,
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 10
            }
          }
        ],
        responses: {
          '200': {
            description: 'Paginated user list retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserListResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/users/{id}': {
      get: {
        security: [{ bearerAuth: [] }],
        tags: ['Users'],
        summary: 'Get user by ID',
        description: 'Cache-aside lookup. Returns from Redis cache if available, otherwise queries PostgreSQL',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'User UUID identifier',
            schema: {
              type: 'string',
              format: 'uuid',
              example: '979b9b6e-b729-4fe5-9333-72af9a835d22'
            }
          }
        ],
        responses: {
          '200': {
            description: 'User details found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserDetailResponse'
                }
              }
            }
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      },
      put: {
        security: [{ bearerAuth: [] }],
        tags: ['Users'],
        summary: 'Update user',
        description: 'Updates user details in PostgreSQL and synchronizes the Redis cache',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'User UUID identifier',
            schema: {
              type: 'string',
              format: 'uuid',
              example: '979b9b6e-b729-4fe5-9333-72af9a835d22'
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateUserInput'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'User updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserResponse'
                }
              }
            }
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '409': {
            description: 'Conflict - Email already in use by another user',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      },
      delete: {
        security: [{ bearerAuth: [] }],
        tags: ['Users'],
        summary: 'Delete user',
        description: 'Deletes user record from PostgreSQL and invalidates Redis cache entry',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'User UUID identifier',
            schema: {
              type: 'string',
              format: 'uuid',
              example: '979b9b6e-b729-4fe5-9333-72af9a835d22'
            }
          }
        ],
        responses: {
          '204': {
            description: 'User deleted successfully (No Content)'
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Bearer token obtained from auth-service'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '979b9b6e-b729-4fe5-9333-72af9a835d22'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'developer@example.com'
          },
          name: {
            type: 'string',
            example: 'Jane Doe'
          },
          role: {
            type: 'string',
            example: 'ENGINEER'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-09-14T20:00:00.000Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-09-14T20:00:00.000Z'
          }
        },
        required: ['id', 'email', 'name', 'role', 'createdAt', 'updatedAt']
      },
      CreateUserInput: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'developer@example.com'
          },
          name: {
            type: 'string',
            minLength: 2,
            example: 'Jane Doe'
          },
          role: {
            type: 'string',
            example: 'ENGINEER'
          }
        },
        required: ['email', 'name']
      },
      UpdateUserInput: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'developer@example.com'
          },
          name: {
            type: 'string',
            minLength: 2,
            example: 'Jane W. Doe'
          },
          role: {
            type: 'string',
            example: 'LEAD_ENGINEER'
          }
        }
      },
      UserResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'success'
          },
          data: {
            $ref: '#/components/schemas/User'
          }
        },
        required: ['status', 'data']
      },
      UserDetailResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'success'
          },
          data: {
            $ref: '#/components/schemas/User'
          },
          meta: {
            type: 'object',
            properties: {
              fromCache: {
                type: 'boolean',
                example: true
              }
            }
          }
        },
        required: ['status', 'data']
      },
      UserListResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'success'
          },
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/User'
            }
          },
          pagination: {
            type: 'object',
            properties: {
              total: {
                type: 'integer',
                example: 1
              },
              page: {
                type: 'integer',
                example: 1
              },
              limit: {
                type: 'integer',
                example: 10
              },
              totalPages: {
                type: 'integer',
                example: 1
              }
            },
            required: ['total', 'page', 'limit', 'totalPages']
          }
        },
        required: ['status', 'data', 'pagination']
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['healthy', 'degraded'],
            example: 'healthy'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2026-09-14T20:00:00.000Z'
          },
          services: {
            type: 'object',
            properties: {
              postgres: {
                type: 'string',
                enum: ['connected', 'disconnected'],
                example: 'connected'
              },
              redis: {
                type: 'string',
                enum: ['connected', 'disconnected', 'unresponsive'],
                example: 'connected'
              }
            },
            required: ['postgres', 'redis']
          }
        },
        required: ['status', 'timestamp', 'services']
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error'
          },
          message: {
            type: 'string',
            example: 'Resource not found'
          }
        },
        required: ['status', 'message']
      }
    }
  }
};
