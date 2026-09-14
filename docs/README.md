# Bruno API Collections (`docs/`)

Coleção oficial de requisições HTTP para a plataforma de microserviços utilizando o [Bruno](https://www.usebruno.com/).

---

## 📂 Estrutura de Pastas

A pasta `docs/` foi estruturada para manter todas as requisições organizadas por microserviço (`ms`):

```
docs/
├── bruno.json                      # Descritor da coleção Bruno
├── environments/                   # Variáveis de ambiente
│   ├── local.bru                   # Ambiente Local (Docker / localhost:3000)
│   └── production.bru              # Ambiente de Produção
├── user-service/                   # Microserviço: User Service
│   ├── folder.bru
│   ├── health/                     # Health checks
│   │   ├── folder.bru
│   │   └── health-check.bru        # GET /health
│   └── users/                      # Gerenciamento de Usuários
│       ├── folder.bru
│       ├── create-user.bru         # POST /api/v1/users (salva {{user_id}} automaticamente)
│       ├── list-users.bru          # GET /api/v1/users?page=1&limit=10
│       ├── get-user-by-id.bru      # GET /api/v1/users/{{user_id}}
│       ├── update-user.bru         # PUT /api/v1/users/{{user_id}}
│       └── delete-user.bru         # DELETE /api/v1/users/{{user_id}}
└── README.md                       # Guia de uso da coleção
```

---

## 🚀 Como Usar no Bruno

1. Baixe e instale o [Bruno](https://www.usebruno.com/).
2. Abra o aplicativo Bruno e clique em **"Open Collection"**.
3. Selecione a pasta `docs/` na raiz deste repositório.
4. No canto superior direito do Bruno, selecione o ambiente **`local`**.
5. Execute as requisições desejadas!

---

## 💡 Dicas de Uso

- **Captura Automática de ID**: Ao executar a requisição `Create User`, o script pós-resposta (`script:post-response`) automaticamente armazena o `id` retornado na variável `user_id`. Com isso, você pode rodar em sequência `Get User by ID`, `Update User` e `Delete User` sem precisar copiar e colar UUIDs manualmente.
- **Novos Microserviços**: Ao adicionar um novo serviço (ex.: `order-service`), crie uma nova pasta `docs/order-service/` com suas rotas e adicione a respectiva variável de URL (`order_service_url`) no arquivo `environments/local.bru`.
