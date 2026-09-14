---
trigger: always_on
---

---
description: Backend architecture and layer responsibilities
globs: api/**/*.{js,ts}
alwaysApply: false
---

# Backend Architecture

## Layer Responsibilities

- **Schema** (`/src/app/schemas`): Input validation with Joi only. Always first middleware.
- **Middleware** (`/src/app/middlewares`): DB validations, ACL, existence checks. Between Schema and Controller.
- **Controller** (`/src/app/controllers`): Receive request, delegate to Service, return response. Always last.
- **Service** (`/src/app/services`): Business logic and orchestration. Transaction handling here.
- **Repository** (`/src/app/repositories`): Direct DB access only.
- **Types** (`/src/types`): All cross-layer TypeScript interfaces and types. Organized by layer and domain (`controllers/`, `services/`, `repositories/`, `mappers/`, `schemas/`, `entities/`, `shared/`, `vendors/`). Import via `@src/types/...`. The legacy `/src/app/types` folder has been removed — never recreate it.

## Critical Blockers

- Controller must NOT contain business logic or validation
- Service must NOT access req/res directly
- Validation must be in Schema, not Controller/Middleware
- Write operations require transactions
- Types must NOT be declared inline in source files — extract them to `api/src/types/{layer}/{domain}/{use-case}.ts` and import from the domain barrel (`@src/types/{layer}/{domain}`)
- Never place a new type under `api/src/app/types/` — that folder is removed

## Route Order

```javascript
router.post('/',
  schema.create,      // 1st - Input validation
  middleware.validate, // 2nd - DB check
  controller.create   // 3rd - Handler
);
```

## CRUD Naming

| Operation | Method    | HTTP   | Status |
|-----------|-----------|--------|--------|
| Create    | `create`  | POST   | 201    |
| Read One  | `findOne` | GET    | 200    |
| Read All  | `findAll` | GET    | 200    |
| Update    | `update`  | PUT    | 200    |
| Delete    | `remove`  | DELETE | 204    |

## Utility Functions

- **ALWAYS** use `Utils.getFolderStorage({ organization_id, company_id })` from `@src/app/utils/index` to generate folder storage prefixes
- **NEVER** inline the prefix logic (e.g. `${org.split('-')[0]}-${company.split('-')[0]}`) — use the utility instead
- This applies anywhere a storage path/prefix is constructed from `organization_id` and `company_id`

```typescript
import { Utils } from '@src/app/utils/index';

const prefix = Utils.getFolderStorage({ organization_id, company_id });
```