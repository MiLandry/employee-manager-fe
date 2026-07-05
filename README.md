# Employee Manager — Frontend

Baseline React + TypeScript + Vite app that verifies BFF connectivity via `GET /health`, with optional [MSW](https://mswjs.io/) mocking for backend-free development.

## Environment variables

Copy the example file and adjust as needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:3000` | BFF base URL for API requests |

MSW is controlled by scripts only (not env vars): use `bun run dev:mock` to enable mocking.

## Frontend Architecture

This frontend is a React + TypeScript app built on Vite, with a BFF-style backend layer that exposes REST JSON endpoints. The UI is designed to consume backend APIs through a stable contract, while keeping frontend network dependencies isolated behind a small service abstraction.

Key architecture decisions:

- The UI uses a JSON REST contract against backend endpoints such as `/health` and `/api/*`.
- A BFF-style backend layer is the source of truth for frontend API responses, allowing the frontend to remain decoupled from downstream services.
- [Mock Service Worker (MSW)](https://mswjs.io/) intercepts API requests in development and tests so UI work can continue without a running backend.
- Bun is the chosen test harness runtime for frontend assertions.

## Development Tooling

- `bun run dev` (or `bun dev`) — runs `predev` (GraphQL codegen), then Vite dev server against a live BFF (MSW off).
- `bun run dev:mock` — runs `predev:mock` (GraphQL codegen), then Vite `--mode mock`; starts MSW and mocks `GET /health`.
- `bun run build`, `bun build:app`, or `bun run build:app` — runs `prebuild:app` (API codegen), then TypeScript check + Vite production bundle.
- `bun run lint` — ESLint for TypeScript and React.
- `bun test` — frontend tests (Bun test runner).
- `bun run test:watch` — tests in watch mode.
- `bun run msw:init` — (re)generate `public/mockServiceWorker.js`.
- `bun run codegen:api` — regenerate `src/generated/openapi.ts` from the sibling `system-specs` spec 002 OpenAPI file (`prebuild:app` runs this before `build:app`).
- `bun run clean` — remove `dist/`, `dist-ssr/`, `src/generated/` (OpenAPI client), and Vite/TypeScript caches under `node_modules`.
- `bun run nuke` — `clean` plus remove `node_modules/`, then `bun install` (near–fresh-clone reset; keeps `bun.lock` and `.env`).

### Cleanup

| Command | Removes | Keeps |
|---------|---------|-------|
| `bun run clean` | `dist/`, `dist-ssr/`, `src/generated/`, `node_modules/.tmp/`, `node_modules/.vite/` | `node_modules/`, hand-written `src/`, lockfile, `.env` |
| `bun run nuke` | everything `clean` removes, plus `node_modules/` (then reinstalls) | hand-written `src/`, `tests/`, `public/`, `bun.lock`, `.env` |

After `clean` or `nuke`, run `bun run build:app` (or `bun run dev`) to regenerate `src/generated/openapi.ts` via `prebuild:app`. After `nuke`, you do not need `msw:init` again unless you deleted `public/mockServiceWorker.js`.

> **Note:** `bun build` alone is Bun’s bundler CLI and will fail with “Missing entrypoints”. This project uses Vite; always run **`bun run build`** or **`bun build:app`**.

## CI

This repo includes a frontend-only GitHub Actions workflow at `.github/workflows/ci.yml`.

- Trigger: `pull_request` and pushes to `main`
- Checks: install dependencies, lint, test, build
- Codegen dependency: CI checks out `system-specs` and links it to `../system-specs` so `codegen:api` can resolve the canonical OpenAPI path during build
- Fallback plan: if checkout/pathing fails in CI, temporarily gate on install/lint/test only, then restore build once the path issue is fixed
- Deferred follow-up: multi-repo required-check governance and broader FE/BE policy hardening

CI command parity:

```bash
bun install --frozen-lockfile
bun run lint
bun test
bun run build
```

## API and Mocking (MSW)

This project uses **Mock Service Worker** to mock the BFF health contract without changing production fetch code:

- `src/services/healthApi.ts` — health contract types and `fetchHealthStatus`
- `src/mocks/handlers/health.ts` — MSW handlers for `GET /health`
- `src/mocks/browser.ts` — browser worker (started only in `dev:mock` mode)
- `src/mocks/server.ts` — `setupServer` for Bun tests

First-time setup:

```bash
bun run msw:init
cp .env.example .env
```

Run dev with mocked health (no backend):

```bash
bun run dev:mock
```

See `system-specs/specs/architecture/001-baseline-app-poc/quickstart.md` for the full verification path.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
