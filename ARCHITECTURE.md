# Frontend Architecture: REST + BFF

## Overview

The frontend is implemented as a React + TypeScript application powered by Vite. The application is designed to consume REST APIs from a backend BFF layer.

A Backend-For-Frontend (BFF) is used to:

- centralize API contract logic for the UI
- translate or aggregate backend data into a UI-friendly JSON shape
- keep the frontend decoupled from downstream service details
- allow the frontend to call a small stable set of endpoints rather than many internal services

## REST contract principles

The UI layer communicates using standard HTTP/JSON semantics:

- `GET /health` returns service health and readiness information
- Requests and responses are JSON
- The frontend uses `fetch` with explicit headers and error-handling
- Endpoint paths are centralized behind a service abstraction

### Health contract

```ts
export type HealthStatus = {
  status: 'ok' | 'error'
  timestamp: string
  message?: string
}
```

This contract is intentionally minimal to support the baseline connectivity proof.

## Backend-For-Frontend design

The BFF is responsible for serving UI-specific endpoints under a stable namespace such as `/api`:

- `GET /health` — backend health endpoint used by the baseline UI
- `GET /api/employees` — future BFF endpoint for employee list data
- `POST /api/employees` — future BFF endpoint for create/update workflows

The frontend should never call downstream services directly. Instead, the BFF provides the single network boundary for the application.

## UI development autonomy (MSW)

To enable frontend work without backend availability, the project uses **Mock Service Worker (MSW)** to intercept HTTP requests:

- `src/services/healthApi.ts` — client contract and `fetchHealthStatus` (always uses `fetch`)
- `src/mocks/handlers/health.ts` — MSW handlers returning `HealthStatus` JSON for `GET /health`
- `src/mocks/browser.ts` — starts the MSW service worker when running `bun run dev:mock`
- `src/mocks/server.ts` — `setupServer` for Bun tests using the same handlers

The UI does not use a separate in-memory mock client. MSW keeps development and tests on the same network path as production.

Enable mocking in development:

```bash
bun run dev:mock
```

Run `bun run msw:init` once to generate `public/mockServiceWorker.js`.

## Network configuration

Environment variables (see `.env.example`):

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | `http://localhost:3000` | BFF base URL for `fetchHealthStatus` |

Default behaviors:

- the URL is normalized so requests do not duplicate trailing slashes
- MSW runs only when started via `bun run dev:mock` (`import.meta.env.MODE === 'mock'`)
- `bun run dev` expects a running BFF
- the baseline page in `App.tsx` calls `fetchHealthStatus` on mount and surfaces success or error state

## Testing and tooling

This frontend uses Bun as the test harness:

- `bun test` runs the frontend test suite
- `bun test --watch` runs tests in watch mode

The test suite is intentionally lightweight and focused on contract and utility validation.

## Tooling stack

- React
- Vite
- TypeScript
- ESLint
- Bun for test execution
