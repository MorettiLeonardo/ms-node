# API Documentation (`docs/`)

Coleções oficiais de requisições HTTP e especificações OpenAPI/Swagger para a plataforma de microserviços.

---

## 📂 Estrutura de Pastas

A pasta `docs/` organiza tanto as coleções do [Bruno](https://www.usebruno.com/) quanto as especificações **Swagger / OpenAPI 3.0** por microserviço (`ms`):

```
docs/
├── bruno.json                      # Descritor da coleção Bruno
├── environments/                   # Ambientes configurados para o Bruno
│   ├── local.bru                   # Ambiente Local (Docker / localhost:3000)
│   └── production.bru              # Ambiente de Produção
├── user-service/                   # Microserviço: User Service
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
└── README.md                       # Guia de documentação da API
```

---

## 🌐 Swagger UI Interativo no Navegador

Cada microserviço disponibiliza o **Swagger UI interativo** diretamente no seu servidor Express:

| Microserviço | Swagger UI | OpenAPI JSON |
|---|---|---|
| `user-service` | [http://localhost:3000/docs](http://localhost:3000/docs) (ou `/api-docs`) | [http://localhost:3000/docs/swagger.json](http://localhost:3000/docs/swagger.json) |

---

## 🚀 Como Usar no Bruno

1. Baixe e instale o [Bruno](https://www.usebruno.com/).
2. Abra o aplicativo Bruno e clique em **"Open Collection"**.
3. Selecione a pasta `docs/` na raiz deste repositório.
4. No canto superior direito do Bruno, selecione o ambiente **`local`**.
5. Execute as requisições desejadas!

---

## 💡 Dicas de Uso

- **Novos Microserviços**: Ao adicionar um novo serviço (ex.: `order-service`), crie uma nova pasta `docs/order-service/` com seus arquivos `swagger.yaml`, `swagger.json` e `.bru`, mantendo o padrão unificado por microserviço.
