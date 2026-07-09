# Employee Manager — Frontend

React + TypeScript + Vite app that talks to the BFF through a single GraphQL endpoint via [Apollo Client](https://www.apollographql.com/docs/react/), with optional [MSW](https://mswjs.io/) mocking for backend-free development. See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full GraphQL contract and tooling details.

## Environment variables

Copy the example file and adjust as needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_GRAPHQL_URL` | `http://localhost:4000/graphql` | Apollo Router (GraphQL gateway) endpoint |
| `VITE_MOCK_USER_ID` | `u-dev` | `x-mock-user-id` header sent on every request |
| `VITE_MOCK_ROLES` | `admin` | Default `x-mock-roles` header when no UI role is set |

MSW is controlled by scripts only (not env vars): use `bun run dev:mock` to enable mocking.

## Frontend Architecture

This frontend is a React + TypeScript app built on Vite. The UI talks to the BFF through a single GraphQL endpoint using Apollo Client; the BFF centralizes contract logic and keeps the frontend decoupled from downstream services.

Key architecture decisions:

- The UI uses a single GraphQL endpoint (`VITE_GRAPHQL_URL`) via Apollo Client — there is no REST/JSON contract.
- A BFF-style backend layer is the source of truth for the GraphQL schema, allowing the frontend to remain decoupled from downstream services.
- [Mock Service Worker (MSW)](https://mswjs.io/) intercepts GraphQL requests in development and tests so UI work can continue without a running backend.
- Bun is the chosen test harness runtime for frontend assertions.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the GraphQL contract, codegen pipeline, and full tooling stack.

## Development Tooling

- `bun run dev` (or `bun dev`) — runs `predev` (GraphQL codegen), then Vite dev server against a live BFF (MSW off).
- `bun run dev:mock` — runs `predev:mock` (GraphQL codegen), then Vite `--mode mock`; starts MSW and mocks GraphQL operations.
- `bun run build`, `bun build:app`, or `bun run build:app` — runs `prebuild:app` (GraphQL codegen), then TypeScript check + Vite production bundle.
- `bun run lint` — ESLint for TypeScript and React.
- `bun test` — frontend tests (Bun test runner).
- `bun run test:watch` — tests in watch mode.
- `bun run msw:init` — (re)generate `public/mockServiceWorker.js`.
- `bun run codegen:graphql` — regenerate `src/generated/graphql/` from the sibling `system-specs` GraphQL schema (see [ARCHITECTURE.md](./ARCHITECTURE.md) for the canonical schema path); `predev`, `predev:mock`, `prebuild:app`, and `test` all run this automatically.
- `bun run clean` — remove `dist/`, `dist-ssr/`, `src/generated/` (GraphQL codegen output), and Vite/TypeScript caches under `node_modules`.
- `bun run nuke` — `clean` plus remove `node_modules/`, then `bun install` (near–fresh-clone reset; keeps `bun.lock` and `.env`).

### Cleanup

| Command | Removes | Keeps |
|---------|---------|-------|
| `bun run clean` | `dist/`, `dist-ssr/`, `src/generated/`, `node_modules/.tmp/`, `node_modules/.vite/` | `node_modules/`, hand-written `src/`, lockfile, `.env` |
| `bun run nuke` | everything `clean` removes, plus `node_modules/` (then reinstalls) | hand-written `src/`, `tests/`, `public/`, `bun.lock`, `.env` |

After `clean` or `nuke`, run `bun run build:app` (or `bun run dev`) to regenerate `src/generated/graphql/` via `prebuild:app`. After `nuke`, you do not need `msw:init` again unless you deleted `public/mockServiceWorker.js`.

> **Note:** `bun build` alone is Bun’s bundler CLI and will fail with “Missing entrypoints”. This project uses Vite; always run **`bun run build`** or **`bun build:app`**.

## CI

This repo includes a frontend-only GitHub Actions workflow at `.github/workflows/ci.yml`.

- Trigger: `pull_request` and pushes to `main`
- Checks: install dependencies, lint, test, build
- Codegen dependency: CI checks out `system-specs` and links it to `../system-specs` so `codegen:graphql` can resolve the canonical GraphQL schema path during build
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

This project uses **Mock Service Worker** to mock the GraphQL contract without changing production Apollo Client code:

- `src/services/graphqlErrors.ts` — GraphQL error handling helpers
- `src/services/mockAuth.ts` — mock auth header helpers (`x-mock-user-id`, `x-mock-roles`)
- `src/mocks/handlers/graphql.ts` — MSW `graphql.link` handlers per operation name
- `src/mocks/browser.ts` — browser worker (started only in `dev:mock` mode)
- `src/mocks/server.ts` — `setupServer` for Bun tests

First-time setup:

```bash
bun run msw:init
cp .env.example .env
```

Run dev with mocked GraphQL (no backend):

```bash
bun run dev:mock
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full GraphQL contract and mocking details.

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
