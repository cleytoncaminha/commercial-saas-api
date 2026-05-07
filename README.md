# Commercial SaaS API

Portfolio backend for a multi-tenant SaaS API for small businesses.

Built with NestJS, TypeScript, PostgreSQL and TypeORM.

## Requirements

- Node.js
- pnpm
- Docker, for local PostgreSQL

## Setup

```bash
pnpm install
```

Create a local `.env` based on `.env.example` if you need custom values.

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Run the API in development:

```bash
pnpm start:dev
```

The API uses the global prefix `/api/v1`.

Swagger is available at `/docs`.

## Commands

```bash
pnpm build
pnpm lint
pnpm lint:fix
pnpm test
pnpm test:e2e
```

## Current Foundation

- Global validation pipe with whitelist and transform enabled.
- Helmet, compression and CORS configured during bootstrap.
- PostgreSQL connection configured through `@nestjs/config` and TypeORM.
- Database synchronization disabled; migrations should be used for schema changes.
- Health endpoint: `GET /api/v1/health`.

## Planned Modules

- auth
- users
- tenants
- roles
- permissions
- customers
- products
- sales
- dashboard
- database
- common

## Multi-Tenancy

The planned strategy is schema-per-tenant for portfolio-friendly isolation.

Global data should stay in shared tables such as users, tenants, roles and permissions.

Tenant data should live in tenant schemas, for example `tenant_demo_store`.
