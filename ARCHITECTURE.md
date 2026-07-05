# Frontend Architecture: GraphQL + Apollo

## Overview

The frontend is a React + TypeScript application powered by Vite. The UI talks to the BFF through a **single GraphQL endpoint** using **Apollo Client**.

The BFF (Backend-For-Frontend) centralizes contract logic, aggregates data for the UI, and keeps the frontend decoupled from downstream services.

## GraphQL contract principles

- Canonical schema: `system-specs/specs/architecture/010-graphql-apollo-protocol/contracts/schema.graphql`
- Operations live in `src/graphql/*.graphql`; types and documents are generated to `src/generated/graphql/`
- `bun run codegen:graphql` refreshes the Apollo client preset output; `predev`, `predev:mock`, `prebuild:app`, and `test` all run it automatically
- Mock auth headers are attached on every request via Apollo `SetContextLink`

### Core operations

| Operation | Purpose |
|-----------|---------|
| `Health` query | Service and database readiness (replaces `GET /health`) |
| `Employees` query | Employee grid list with optional filters |
| `CreateEmployee` / `UpdateEmployee` / `DeleteEmployee` | CRUD dialogs |

## UI development autonomy (MSW)

**Mock Service Worker** intercepts GraphQL at `VITE_GRAPHQL_URL`:

- `src/lib/apolloClient.ts` — Apollo Client + auth link
- `src/mocks/handlers/graphql.ts` — MSW `graphql.link` handlers per operation name
- `src/mocks/browser.ts` — service worker for `bun run dev:mock`
- `src/mocks/server.ts` — `setupServer` for Bun tests

```bash
bun run dev:mock
```

## Network configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_GRAPHQL_URL` | `http://localhost:3000/graphql` | Apollo `HttpLink` endpoint |
| `VITE_MOCK_USER_ID` | `u-dev` | `x-mock-user-id` header |
| `VITE_MOCK_ROLES` | `admin` | Default `x-mock-roles` when UI role not set |

Runtime mock role from the employee page overrides env defaults via `setRuntimeMockRole`.

## Testing and tooling

- `bun test` — MSW-backed Apollo integration tests in `tests/graphql*.test.ts`
- `bun run codegen:graphql` — regenerate types after schema changes

## Tooling stack

- React, Vite, TypeScript
- Apollo Client, GraphQL Code Generator (client preset)
- MSW, MUI, Bun
