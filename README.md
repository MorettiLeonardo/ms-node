# Node.js TypeScript Microservices Platform

A modular, production-ready microservices architecture built with **Node.js**, **TypeScript**, **Docker**, **Prisma ORM (PostgreSQL)**, and **Redis Cache**, adhering to **Clean Architecture**, **Repository Pattern**, and strict project quality standards with **Oxlint** and **Prettier**.

---

## 🏗️ Architecture & Layer Responsibilities

Each microservice is designed with strict separation of concerns and dependency injection:

```
                  ┌──────────────┐
                  │ HTTP Request │
                  └──────┬───────┘
                         ▼
        ┌──────────────────────────────────┐
        │ Schema Layer (Input Validation)  │  1st: Validate shape, params & payload
        └────────────────┬─────────────────┘
                         ▼
        ┌──────────────────────────────────┐
        │ Middleware Layer (DB/ACL Checks) │  2nd: Existence & uniqueness checks
        └────────────────┬─────────────────┘
                         ▼
        ┌──────────────────────────────────┐
        │ Controller Layer (HTTP Handler)  │  3rd: Delegate to service, return response
        └────────────────┬─────────────────┘
                         ▼
        ┌──────────────────────────────────┐
        │ Service Layer (Business Logic)   │  Transactions, Cache-Aside & orchestration
        └────────┬────────────────┬────────┘
                 ▼                ▼
        ┌────────────────┐ ┌──────────────┐
        │ Cache (Redis)  │ │  Repository  │  Direct database access via Prisma
        └────────────────┘ └──────┬───────┘
                                  ▼
                           ┌──────────────┐
                           │  PostgreSQL  │
                           └──────────────┘
```

### Layer Standards
- **Schema (`src/schemas/`)**: Input validation only. Always the first middleware in the route chain.
- **Middleware (`src/middlewares/`)**: Database existence/uniqueness checks, ACL, logging, and error handling.
- **Controller (`src/controllers/`)**: Dispatches request to the service layer and formats HTTP response. Contains zero business logic or validation.
- **Service (`src/services/`)**: Core business logic, cache coordination, and transactional write operations.
- **Repository (`src/repositories/`)**: Direct database interaction via Prisma, returning `[data, error]` result tuples.
- **Types (`src/types/`)**: Centralized TypeScript definitions organized by layer (`types/{repositories,services,controllers,cache,shared}/`).
- **Path Aliases**: All imports utilize the absolute `@src/*` alias.

---

## 📁 Repository Directory Structure

```
learns-ms/
├── .agents/
│   └── rules/                      # Architectural, Clean Code & Style rules
├── docs/                           # Bruno API Collections organized per microservice
│   ├── environments/               # Environment configs (local, production)
│   ├── user-service/               # User Service endpoints (.bru)
│   └── bruno.json                  # Bruno collection descriptor
├── docker-compose.yml              # Container orchestration (PostgreSQL, Redis, Services)
├── services/
│   └── user-service/               # User Microservice
│       ├── prisma/
│       │   └── schema.prisma       # Prisma ORM schema (PostgreSQL provider)
│       ├── src/
│       │   ├── config/             # Environment, Prisma & Redis singletons
│       │   ├── constants/          # Application & cache constants
│       │   ├── controllers/        # Express controllers (PascalCase class, kebab-case file)
│       │   ├── errors/             # Custom domain errors (AppError)
│       │   ├── middlewares/        # Error, logging & validation middlewares
│       │   ├── repositories/       # Prisma repository implementations
│       │   ├── routes/             # Express routes with strict layer order
│       │   ├── schemas/            # Request validation schemas & middleware
│       │   ├── services/           # Business logic with transactions & caching
│       │   ├── types/              # Cross-layer TypeScript interfaces & tuples
│       │   ├── app.ts              # Express App configuration class
│       │   └── index.ts            # Server bootstrap class & graceful shutdown
│       ├── Dockerfile              # Multi-stage Docker build (dev / prod)
│       ├── .oxlintrc.json          # Oxlint configuration
│       ├── .prettierrc             # Prettier configuration (trailingComma: none, printWidth: 120)
│       ├── tsconfig.json           # TypeScript configuration with @src/* path alias
│       └── package.json
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start (Docker Compose)

Start the entire ecosystem (PostgreSQL 16, Redis 7, and User Service):

```bash
docker compose up --build -d
```

Verify running containers and healthchecks:
```bash
docker compose ps
```

Stream logs:
```bash
docker compose logs -f user-service
```

Stop the stack:
```bash
docker compose down
```

---

## 📡 API Endpoints (`user-service`)

Base URL: `http://localhost:3000`

### CRUD Standard Naming & Status Codes

| Operation | HTTP Method | Endpoint | Status Code | Description |
|---|---|---|---|---|
| Health Check | `GET` | `/health` | `200` | Verifies PostgreSQL and Redis connectivity |
| Create | `POST` | `/api/v1/users` | `201` | Creates user in DB and warms Redis cache |
| Read All | `GET` | `/api/v1/users` | `200` | Retrieves paginated users list (`?page=1&limit=10`) |
| Read One | `GET` | `/api/v1/users/:id` | `200` | Cache-aside lookup (returns `fromCache: true` on hit) |
| Update | `PUT` | `/api/v1/users/:id` | `200` | Transactional update with cache synchronization |
| Delete | `DELETE` | `/api/v1/users/:id` | `204` | Deletes user from DB and invalidates cache |

### Example Request Payloads

#### Create User (`POST /api/v1/users`)
```json
{
  "email": "developer@example.com",
  "name": "Jane Doe",
  "role": "ENGINEER"
}
```

#### Update User (`PUT /api/v1/users/:id`)
```json
{
  "name": "Jane W. Doe",
  "role": "LEAD_ENGINEER"
}
```

---

## 📖 API Documentation (Bruno Collection)

All HTTP endpoints are documented and ready for execution with [Bruno](https://www.usebruno.com/) under the [`docs/`](file:///c:/Users/Usuario/learns-ms/docs) directory:

- **Collection Root**: `docs/` (contains `bruno.json`)
- **Environments**: `docs/environments/local.bru` (`http://localhost:3000`) and `production.bru`
- **Organized per Microservice**:
  - `docs/user-service/health/` (Health check endpoint)
  - `docs/user-service/users/` (CRUD operations)
- **Auto Variable Capture**: Running `Create User` automatically sets `{{user_id}}` so subsequent `Get by ID`, `Update`, and `Delete` requests work seamlessly.

---

## 🛠️ Code Quality & Tooling

Inside `services/user-service`:

| Command | Tool | Purpose |
|---|---|---|
| `npm run lint` | **Oxlint** | High-speed Rust-based linter for static analysis |
| `npm run format` | **Prettier** | Code formatting adhering to workspace rules |
| `npm run format:check` | **Prettier** | Verifies format consistency |
| `npm run typecheck` | **TypeScript** | Strict compile-time type verification (`tsc --noEmit`) |
| `npm run build` | **tsc + tsc-alias** | Compiles TypeScript and resolves `@src/*` aliases into `dist/` |
| `npm run dev` | **tsx** | Live development server with hot module reloading |

---

## ➕ Adding a New Microservice

To add another microservice (e.g. `services/product-service`):
1. Copy the structure from `services/user-service` to `services/<new-service>`.
2. Define the service domain models in `prisma/schema.prisma`.
3. Implement the `Repository`, `Service`, `Schema`, `Controller`, and `Router` classes.
4. Add the service definition to root `docker-compose.yml` joined to the `learns-network`.
