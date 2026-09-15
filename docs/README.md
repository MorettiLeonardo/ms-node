# API Documentation (`docs/`)

Coleções oficiais de requisições HTTP e especificações OpenAPI/Swagger para a plataforma de microserviços.

---

## 📂 Estrutura de Pastas

A pasta `docs/` organiza tanto as coleções do [Bruno](https://www.usebruno.com/) quanto as especificações **Swagger / OpenAPI 3.0** por microserviço (`ms`):

```
docs/
├── bruno.json                      # Descritor da coleção Bruno
├── environments/                   # Ambientes configurados para o Bruno
│   ├── local.bru                   # Ambiente Local (Docker: user:3000, auth:3001)
│   └── production.bru              # Ambiente de Produção
├── user-service/                   # Microserviço: User Service (Express + PostgreSQL + Redis)
│   ├── swagger.yaml                # Especificação OpenAPI 3.0 em YAML
│   ├── swagger.json                # Especificação OpenAPI 3.0 em JSON
│   ├── folder.bru
│   ├── health/                     # Health checks
│   │   ├── folder.bru
│   │   └── health-check.bru        # GET /health
│   └── users/                      # Gerenciamento de Usuários
│       ├── folder.bru
│       ├── create-user.bru         # POST /api/v1/users
│       ├── list-users.bru          # GET /api/v1/users?page=1&limit=10
│       ├── get-user-by-id.bru      # GET /api/v1/users/{{user_id}}
│       ├── update-user.bru         # PUT /api/v1/users/{{user_id}}
│       └── delete-user.bru         # DELETE /api/v1/users/{{user_id}}
├── auth-service/                   # Microserviço: Auth Service (Fastify + MySQL + JWT)
│   ├── swagger.yaml                # Especificação OpenAPI 3.0 em YAML
│   ├── swagger.json                # Especificação OpenAPI 3.0 em JSON
│   ├── folder.bru
│   ├── health/                     # Health checks
│   │   ├── folder.bru
│   │   └── health-check.bru        # GET /health
│   └── auth/                       # Operações de Autenticação
│       ├── folder.bru
│       ├── register.bru            # POST /register
│       ├── login.bru               # POST /login
│       ├── refresh.bru             # POST /refresh
│       ├── me.bru                  # GET /me
│       └── logout.bru              # POST /logout
└── README.md                       # Guia de documentação da API
```

---

## 🌐 Swagger UI Interativo no Navegador

Cada microserviço disponibiliza o **Swagger UI interativo** diretamente no seu servidor:

| Microserviço | Stack | Swagger UI | OpenAPI JSON |
|---|---|---|---|
| `user-service` | Express + TS + Postgres + Redis | [http://localhost:3000/docs](http://localhost:3000/docs) | [http://localhost:3000/docs/swagger.json](http://localhost:3000/docs/swagger.json) |
| `auth-service` | Fastify + TS + MySQL + JWT | [http://localhost:3001/docs](http://localhost:3001/docs) | [http://localhost:3001/docs/json](http://localhost:3001/docs/json) |

---

## 🚀 Como Usar no Bruno

1. Baixe e instale o [Bruno](https://www.usebruno.com/).
2. Abra o aplicativo Bruno e clique em **"Open Collection"**.
3. Selecione a pasta `docs/` na raiz deste repositório.
4. No canto superior direito do Bruno, selecione o ambiente **`local`**.
5. Execute as requisições desejadas!

---

## 💡 Dicas de Uso

- **Fluxo de Autenticação no Bruno**:
  1. Execute `auth-service/auth/register` ou `login` -> tokens são salvos automaticamente nas variáveis de ambiente do Bruno (`access_token` e `refresh_token`).
  2. Execute `auth-service/auth/me` -> usa `{{access_token}}` via Bearer auth.
  3. Execute `auth-service/auth/refresh` -> renova o token e salva o novo par de tokens.
  4. Execute `auth-service/auth/logout` -> revoga o refresh token.
