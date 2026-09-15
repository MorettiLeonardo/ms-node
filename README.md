# Node.js TypeScript Microservices Platform

A modular, production-ready microservices architecture built with **Node.js**, **TypeScript**, **Docker**, **Prisma ORM**, **Express (PostgreSQL & Redis)**, and **Fastify (MySQL & JWT)**, adhering to **Clean Architecture**, **Repository Pattern**, and strict project quality standards with **Oxlint** and **Prettier**.

---

## 🏗️ Architecture & Layer Responsibilities

Each microservice is designed with strict separation of concerns and dependency injection:

```
                  ┌──────────────┐
                  │ HTTP Request │
                  └──────┬───────┘
                         ▼
        ┌──────────────────────────────────┐
        │ Schema Layer (Input Validation)  │  1st: Validate shape, params & payload (Zod)
        └────────────────┬─────────────────┘
                         ▼
        ┌──────────────────────────────────┐
        │ Middleware Layer (DB/ACL Checks) │  2nd: Existence, JWT verification & uniqueness
        └────────────────┬─────────────────┘
                         ▼
        ┌──────────────────────────────────┐
        │ Controller Layer (HTTP Handler)  │  3rd: Delegate to service, return response
        └────────────────┬─────────────────┘
                         ▼
        ┌──────────────────────────────────┐
        │ Service Layer (Business Logic)   │  Transactions, tokens, caching & orchestration
        └────────┬────────────────┬────────┘
                 ▼                ▼
        ┌────────────────┐ ┌──────────────┐
        │ Cache (Redis)  │ │  Repository  │  Direct database access via Prisma
        └────────────────┘ └──────┬───────┘
                                  ▼
                    ┌───────────────────────────┐
                    │ PostgreSQL / MySQL (Docker)│
                    └───────────────────────────┘
```

### Layer Standards
- **Schema (`src/schemas/`)**: Input validation only. Always the first step in the route chain (`preValidation` in Fastify).
- **Middleware (`src/middlewares/`)**: Database existence/uniqueness checks, ACL, JWT verification (`preHandler` in Fastify).
- **Controller (`src/controllers/`)**: Dispatches request to the service layer and formats HTTP response. Contains zero business logic or validation. Every method implements `try ... catch ... finally` with `init`, `error`, and `finish` logs.
- **Service (`src/services/`)**: Core business logic, token generation, and transactional write operations. Every method implements `try ... catch ... finally` with `init`, `error`, and `finish` logs.
- **Repository (`src/repositories/`)**: Direct database interaction via Prisma, returning `[data, error]` result tuples. Every method implements `try ... catch ... finally` with `init`, `error`, and `finish` logs.
- **Types (`src/types/`)**: Centralized TypeScript definitions organized by layer (`types/{repositories,services,controllers,shared}/`).
- **Path Aliases**: All imports utilize the absolute `@src/*` alias.

---

## 📁 Repository Directory Structure

```
learns-ms/
├── .agents/
│   └── rules/                      # Architectural, Clean Code & Style rules
├── docs/                           # Bruno API Collections & OpenAPI specs per microservice
│   ├── environments/               # Environment configs (local, production)
│   ├── user-service/               # User Service endpoints (.bru, swagger.json, swagger.yaml)
│   ├── auth-service/               # Auth Service endpoints (.bru, swagger.json, swagger.yaml)
│   └── bruno.json                  # Bruno collection descriptor
├── docker-compose.yml              # Multi-container orchestration (Postgres, Redis, MySQL, Services)
├── services/
│   ├── user-service/               # User Microservice (Express + TypeScript + Postgres + Redis)
│   │   ├── prisma/schema.prisma    # PostgreSQL Prisma schema
│   │   ├── src/                    # Layers (schemas, middlewares, controllers, services, repositories)
│   │   └── Dockerfile
│   └── auth-service/               # Auth Microservice (Fastify + TypeScript + MySQL + JWT)
│       ├── prisma/schema.prisma    # MySQL Prisma schema (Account, RefreshToken)
│       ├── src/                    # Layers (schemas, middlewares, controllers, services, repositories)
│       └── Dockerfile
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start (Docker Compose)

Start the entire microservices ecosystem (PostgreSQL 16, Redis 7, MySQL 8, User Service, Auth Service):

```bash
docker compose up --build -d
```

Verify running containers and healthchecks:
```bash
docker compose ps
```

Stream logs:
```bash
# View logs from auth service
docker compose logs -f auth-service

# View logs from all services
docker compose logs -f
```

Stop the stack:
```bash
docker compose down
```

---

## 📡 Microservices Overview

### 1. User Microservice (`user-service`)
- **Port**: `3000`
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 16 (via Prisma ORM)
- **Cache**: Redis 7 (Cache-Aside pattern)
- **Swagger UI**: [http://localhost:3000/docs](http://localhost:3000/docs)

| Operation | Method | Endpoint | Description |
|---|---|---|---|
| Health Check | `GET` | `/health` | PostgreSQL and Redis health verification |
| Create User | `POST` | `/api/v1/users` | Creates user in DB and warms cache |
| List Users | `GET` | `/api/v1/users` | Paginated users list (`?page=1&limit=10`) |
| Get User | `GET` | `/api/v1/users/:id` | Cache-aside lookup |
| Update User | `PUT` | `/api/v1/users/:id` | Transactional update with cache sync |
| Delete User | `DELETE` | `/api/v1/users/:id` | Deletes user from DB and invalidates cache |

### 2. Authentication Microservice (`auth-service`)
- **Port**: `3001`
- **Framework**: Fastify 5.x with TypeScript
- **Database**: MySQL 8.0 (via Prisma ORM)
- **Security**: Fastify JWT, Bcrypt password hashing, rotating refresh tokens (crypto SHA-256)
- **Swagger UI**: [http://localhost:3001/docs](http://localhost:3001/docs)
- **OpenAPI JSON**: [http://localhost:3001/docs/json](http://localhost:3001/docs/json)

| Operation | Method | Endpoint | Auth | Description |
|---|---|---|---|---|
| Health Check | `GET` | `/health` | None | Service uptime and status check |
| Register | `POST` | `/register` | None | Creates account with hashed password, issues JWT and refresh token |
| Login | `POST` | `/login` | None | Authenticates credentials, issues new JWT and refresh token |
| Refresh Token | `POST` | `/refresh` | None | Validates active refresh token, revokes it, and issues new rotated pair |
| Profile (Me) | `GET` | `/me` | Bearer JWT | Returns current authenticated account profile |
| Logout | `POST` | `/logout` | Bearer JWT | Revokes active refresh token or all user refresh tokens |

---

## 📖 API Documentation (Swagger & Bruno)

All HTTP endpoints are documented and ready for execution and exploration:

### 🌐 Swagger UI (Interactive Browser Documentation)

- **User Service Docs**: [http://localhost:3000/docs](http://localhost:3000/docs)
- **Auth Service Docs**: [http://localhost:3001/docs](http://localhost:3001/docs)

### 📁 Bruno Collections & OpenAPI Specs (`docs/`)

Organized under [`docs/`](file:///c:/Users/Usuario/learns-ms/docs) by microservice:
- **Bruno Collection**: Open `docs/` in [Bruno](https://www.usebruno.com/)
- **Environments**: Select `local` (`http://localhost:3000` and `http://localhost:3001`)
- **OpenAPI Specs**:
  - `docs/user-service/swagger.json` and `docs/user-service/swagger.yaml`
  - `docs/auth-service/swagger.json` and `docs/auth-service/swagger.yaml`

---

## 🛠️ Code Quality & Tooling

Inside `services/auth-service` (and `services/user-service`):

| Command | Tool | Purpose |
|---|---|---|
| `npm run lint` | **Oxlint** | High-speed Rust-based linter for static analysis (0 warnings, 0 errors) |
| `npm run format` | **Prettier** | Code formatting adhering to workspace rules |
| `npm run format:check` | **Prettier** | Verifies format consistency |
| `npm run typecheck` | **TypeScript** | Strict compile-time type verification (`tsc --noEmit`) |
| `npm run build` | **tsc + tsc-alias** | Compiles TypeScript and resolves `@src/*` aliases into `dist/` |
| `npm run dev` | **tsx** | Live development server with hot reloading |
| `npm run prisma:generate`| **Prisma** | Generates typed Prisma client |
| `npm run prisma:push` | **Prisma** | Synchronizes schema with database |

---

## ➕ Adding a New Microservice

To add another microservice (e.g. `services/order-service`):
1. Create `services/<new-service>`.
2. Define the service domain models in `prisma/schema.prisma`.
3. Implement `Repository`, `Service`, `Schema`, `Controller`, and `Router` classes.
4. Ensure every function follows `try ... catch ... finally` with `init`, `error`, and `finish` logs.
5. Add the service and database containers to `docker-compose.yml` joined to `learns-network`.
6. Add Bruno requests and Swagger specs to `docs/<new-service>/`.
