# API Documentation (`docs/`)

Coleções oficiais de requisições HTTP e especificações OpenAPI/Swagger para a plataforma de microserviços.

---

## 📂 Estrutura de Pastas

A pasta `docs/` organiza tanto as coleções do [Bruno](https://www.usebruno.com/) quanto as especificações **Swagger / OpenAPI 3.0** por microserviço (`ms`):

```
docs/
├── bruno.json                      # Descritor da coleção Bruno
├── environments/                   # Ambientes configurados para o Bruno
│   ├── local.bru                   # Ambiente Local (Gateway: 8000, user: 3000, auth: 3001)
│   └── production.bru              # Ambiente de Produção
├── gateway-service/                # API Gateway (Fastify + Reverse Proxy)
│   ├── folder.bru
│   ├── health/
│   │   └── health-check.bru        # GET {{gateway_url}}/health
│   ├── auth/
│   │   └── login.bru               # POST {{gateway_url}}/api/v1/auth/login
│   └── users/
│       └── list-users.bru          # GET {{gateway_url}}/api/v1/users (Bearer Auth)
├── user-service/                   # Microserviço: User Service (Express + PostgreSQL + Redis)
│   ├── swagger.yaml                # Especificação OpenAPI 3.0 em YAML
│   ├── swagger.json                # Especificação OpenAPI 3.0 em JSON
│   ├── folder.bru
│   ├── health/                     # Health checks
│   │   ├── folder.bru
│   │   └── health-check.bru        # GET /health
│   └── users/                      # Gerenciamento de Usuários (Requer Bearer Token)
│       ├── folder.bru
│       ├── create-user.bru         # POST /api/v1/users (Bearer Auth)
│       ├── list-users.bru          # GET /api/v1/users?page=1&limit=10 (Bearer Auth)
│       ├── get-user-by-id.bru      # GET /api/v1/users/{{user_id}} (Bearer Auth)
│       ├── update-user.bru         # PUT /api/v1/users/{{user_id}} (Bearer Auth)
│       └── delete-user.bru         # DELETE /api/v1/users/{{user_id}} (Bearer Auth)
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

## 🌐 Endpoints & Documentação Interativa

Cada microserviço disponibiliza o **Swagger UI interativo** e a plataforma conta com um **API Gateway unificado**:

| Serviço | Stack | Porta | Descrição |
|---|---|---|---|
| `gateway-service` | Fastify + HTTP Proxy + TS | `8000` | Ponto de entrada unificado com roteamento reverso e health aggregation |
| `user-service` | Express + TS + Postgres + Redis | `3000` | Microserviço de usuários com Bearer JWT em todas as rotas (`/docs`) |
| `auth-service` | Fastify + TS + MySQL + JWT | `3001` | Microserviço de autenticação e emissão de tokens (`/docs`) |

---

## 🚀 Como Usar no Bruno

1. Baixe e instale o [Bruno](https://www.usebruno.com/).
2. Abra o aplicativo Bruno e clique em **"Open Collection"**.
3. Selecione a pasta `docs/` na raiz deste repositório.
4. No canto superior direito do Bruno, selecione o ambiente **`local`**.
5. Execute as requisições desejadas!

---

## 💡 Dicas de Uso

- **Fluxo de Autenticação e Acesso no Bruno**:
  1. Execute `auth-service/auth/register` ou `login` (ou via `gateway-service/auth/login`) -> tokens são salvos automaticamente nas variáveis de ambiente do Bruno (`access_token` e `refresh_token`).
  2. Execute `user-service/users/*` ou `gateway-service/users/*` -> usa automaticamente `{{access_token}}` via Bearer auth (obrigatório para acessar as rotas de usuário).
  3. Execute `auth-service/auth/refresh` -> renova o token e salva o novo par de tokens.
  4. Execute `gateway-service/health/health-check` -> valida a saúde agregada de todos os microserviços.
