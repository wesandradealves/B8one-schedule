# B8one API

API backend em NestJS com arquitetura DDD, autenticação JWT + 2FA por e-mail, autorização por perfil/permissão, validação com Zod, TypeORM com QueryBuilder e documentação Swagger.

## 1. Stack Técnica

- Node.js 22+
- NestJS 10
- TypeORM 0.3 + PostgreSQL
- Redis + BullMQ (mensageria)
- JWT (Passport)
- Zod (validação de entrada)
- Nodemailer (SMTP)
- Swagger/OpenAPI
- Jest (testes unitários)

## 2. Arquitetura e Padrões

### 2.1 Camadas

- `src/domain`
  - Entidades, enums, contratos (interfaces), tipos e regras comuns.
- `src/modules`
  - Módulos de aplicação (`auth`, `users`, `exams`, `appointments`) com:
    - `api/controllers`
    - `api/dto`
    - `api/schemas` (Zod)
    - `use-cases`
- `src/infrastructure`
  - Implementações concretas: banco, providers, repositories, guards, swagger, health, metrics.

### 2.2 Padrões aplicados

- Regras de negócio centralizadas em **Use Cases**.
- Controle de acesso (perfil/permissão) no backend com **Guards + Use Cases**.
- Endpoints sem duplicação por perfil: o mesmo endpoint responde conforme o usuário autenticado.
- Persistência via **TypeORM QueryBuilder** (sem raw SQL nos repositories).
- Validação de payload/parâmetros com **ZodValidationPipe**.
- Mensageria centralizada via `IMessagingProvider` (BullMQ).

## 3. Perfis, Roles e Permissões

### 3.1 Perfis

- `ADMIN`
- `CLIENT`

### 3.2 Permissões por perfil

Base: `src/domain/commons/constants/profile-permissions.constant.ts`

| Permissão | ADMIN | CLIENT |
|---|---:|---:|
| `EXAMS_READ` | Sim | Sim |
| `EXAMS_CREATE` | Sim | Não |
| `EXAMS_UPDATE` | Sim | Não |
| `EXAMS_DELETE` | Sim | Não |
| `USERS_READ` | Sim | Sim |
| `USERS_CREATE` | Sim | Não |
| `USERS_UPDATE` | Sim | Sim |
| `USERS_DELETE` | Sim | Não |
| `APPOINTMENTS_CREATE` | Sim | Sim |
| `APPOINTMENTS_READ_OWN` | Sim | Sim |
| `APPOINTMENTS_UPDATE` | Sim | Não |
| `APPOINTMENTS_DELETE` | Sim | Não |
| `APPOINTMENTS_CANCEL_OWN` | Sim | Sim |
| `APPOINTMENTS_REQUEST_CHANGE_OWN` | Sim | Sim |
| `APPOINTMENTS_APPROVE_CHANGE` | Sim | Não |

## 4. Regras de Negócio Implementadas

### 4.1 Auth

- `POST /auth/login`
  - Valida credenciais.
  - Gera código 2FA de 6 dígitos com expiração.
  - Envia por e-mail (SMTP).
- `POST /auth/2fa/verify`
  - Código inválido/expirado retorna `401`.
  - Código válido invalida o registro e gera JWT (`Bearer`).

### 4.2 Users

- `GET /users/all`
  - `ADMIN`: lista todos (paginado).
  - `CLIENT`: retorna somente o próprio usuário (paginado).
- `GET /users/:id`
  - `ADMIN`: qualquer usuário.
  - `CLIENT`: apenas o próprio.
- `POST /users`, `DELETE /users/:id`
  - Apenas `ADMIN`.
- `PATCH /users/:id`
  - `ADMIN`: pode atualizar perfil/e-mail/status/senha.
  - `CLIENT`: somente próprio perfil e sem alterar `email/profile/isActive`.

### 4.3 Exams

- `GET /exams/all`
  - `ADMIN`: todos (ativos e inativos), paginado.
  - `CLIENT`: apenas ativos, paginado.
- `GET /exams/:id`
  - `ADMIN`: pode ver qualquer exame.
  - `CLIENT`: somente exames ativos.
- `POST`, `PATCH`, `DELETE`
  - Apenas `ADMIN`.

### 4.4 Appointments

- `GET /appointments/all`
  - `ADMIN`: todos, paginado.
  - `CLIENT`: somente os próprios, paginado.
- `GET /appointments/:id`
  - `ADMIN`: qualquer appointment.
  - `CLIENT`: apenas próprio.
- `POST /appointments`
  - Cria agendamento com validação de data futura e conflito de agenda.
- `PATCH /appointments/:id/cancel`
  - Dono ou admin.
- `PATCH /appointments/:id/request-change`
  - Cliente solicita alteração (pendente para aprovação).
- `PATCH /appointments/:id/approve-change`
  - Apenas admin aprova alteração pendente.
- `PATCH /appointments/:id`
  - Apenas admin (edição direta).
- `DELETE /appointments/:id`
  - Apenas admin.

## 5. Validações

- Entrada validada com Zod em body/query/param.
- Exemplos:
  - paginação: `page >= 1`, `limit <= 100`;
  - UUIDs obrigatórios em `:id` e refs;
  - `scheduledAt` deve ser data válida e futura nos fluxos de agendamento;
  - payloads de update exigem ao menos um campo.

Formato de erro HTTP padronizado pelo `HttpExceptionFilter`:

```json
{
  "statusCode": 400,
  "timestamp": "2026-04-23T17:42:50.829Z",
  "path": "/exams",
  "message": "Validation failed",
  "details": [
    { "path": "name", "message": "String must contain at least 2 character(s)" }
  ]
}
```

## 6. Endpoints

### 6.1 Infra

- `GET /health`
- `GET /metrics`

### 6.2 Auth

- `POST /auth/login`
- `POST /auth/2fa/verify`

### 6.3 Users

- `GET /users/all`
- `GET /users/:id`
- `POST /users`
- `PATCH /users/:id`
- `DELETE /users/:id`

### 6.4 Exams

- `GET /exams/all`
- `GET /exams/:id`
- `POST /exams`
- `PATCH /exams/:id`
- `DELETE /exams/:id`

### 6.5 Appointments

- `GET /appointments/all`
- `GET /appointments/:id`
- `POST /appointments`
- `PATCH /appointments/:id`
- `PATCH /appointments/:id/cancel`
- `PATCH /appointments/:id/request-change`
- `PATCH /appointments/:id/approve-change`
- `DELETE /appointments/:id`

## 7. Swagger e Teste Completo da API

- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/docs-json`

### 7.1 Fluxo para autenticar no Swagger

1. Execute `POST /auth/login` com e-mail/senha.
2. Pegue o código 2FA recebido por e-mail.
3. Execute `POST /auth/2fa/verify` para receber `accessToken`.
4. Clique em **Authorize** no Swagger e informe:
   - `Bearer <accessToken>`
5. Teste os endpoints protegidos.

### 7.2 Confirmação de funcionalidade Swagger

Validação realizada em `23/04/2026` com a aplicação em execução:

- OpenAPI:
  - todos os paths esperados presentes;
  - todos os endpoints protegidos com `security: bearer`;
  - schemas com tipos corretos (string/uuid/date-time/nullable) para todos os campos dos DTOs.
- Auth:
  - login + envio de 2FA;
  - 2FA inválido retornando `401`;
  - 2FA válido emitindo JWT `Bearer`.
- Segurança/validação:
  - endpoint protegido sem token retornando `401`;
  - payload inválido retornando `400` com `details` de validação Zod.
- Smoke funcional de rotas:
  - `health` e `metrics`: `200`;
  - `users`: `all` admin/client `200`, create `201`, get `200`, patch `200`, delete `204`, acesso indevido client em recurso de terceiro `403`;
  - `exams`: create `201`, get `200`, patch `200`, delete `204`, create por client `403`;
  - `appointments`: create `201`, list/get `200`, patch admin `200`, request-change `200`, approve-change `200`, cancel `200`, delete `204`.

## 8. Seed de Dados

Arquivo: `src/infrastructure/database/seeds/run-seed.ts`

### 8.1 Usuários padrão

- Admin
  - e-mail: `admin@b8one.com`
  - senha: `Admin@123`
  - perfil: `ADMIN`
- Cliente
  - e-mail: `cliente@b8one.com`
  - senha: `Client@123`
  - perfil: `CLIENT`

### 8.2 Exames padrão

Seed inclui 10 exames iniciais (hemograma, glicemia, colesterol, etc.).

## 9. Como Rodar

### 9.1 Pré-requisitos

- Node.js `>=22`
- Docker + Docker Compose

### 9.2 Ambiente

```bash
cp .env.example .env
```

Configure SMTP no `.env` para fluxo real de 2FA por e-mail.

### 9.3 Subir stack completa com Docker

```bash
docker compose up -d --build
```

A stack sobe `backend`, `postgres` e `redis`. No container do backend já executa:

- `migration:run:prod`
- `seed:prod`
- `start:prod`

### 9.4 Rodar local (com DB/Redis em container)

```bash
docker compose up -d postgres redis
npm ci
npm run migration:run
npm run seed
npm run start:dev
```

## 10. Scripts Principais

```bash
npm run build
npm run start:dev
npm run start:prod
npm run lint
npm test
npm run migration:run
npm run migration:revert
npm run seed
```

## 11. Qualidade e Gate de Commit

Hooks Git configurados com Husky:

- `pre-commit`: `npm test -- --runInBand`
- `pre-push`: `npm test -- --runInBand`

Objetivo: impedir commit/push sem suíte verde.

## 12. Observações de Segurança

- Não versionar `.env` com credenciais reais.
- Trocar `JWT_ACCESS_TOKEN_SECRET` em produção.
- SMTP em produção deve usar credenciais válidas e `from` corporativo.
