# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Frontend Architecture

This frontend is a React + TypeScript app built on Vite, with a BFF-style backend layer that exposes REST JSON endpoints. The UI is designed to consume backend APIs through a stable contract, while keeping frontend network dependencies isolated behind a small service abstraction.

Key architecture decisions:

- The UI uses a JSON REST contract against backend endpoints such as `/health` and `/api/*`.
- A BFF-style backend layer is the source of truth for frontend API responses, allowing the frontend to remain decoupled from downstream services.
- [Mock Service Worker (MSW)](https://mswjs.io/) intercepts API requests in development and tests so UI work can continue without a running backend.
- Bun is the chosen test harness runtime for frontend assertions.

## Development Tooling

- `yarn dev` starts the Vite development server.
- `yarn build` compiles the app and bundles production assets.
- `yarn lint` validates TypeScript and React code using ESLint.
- `bun test` runs the frontend test harness with Bun's built-in test runner.
- `bun test --watch` runs tests in watch mode.

## API and Mocking (MSW)

This project uses **Mock Service Worker** to mock the BFF health contract without changing production fetch code:

- `src/services/healthApi.ts` — health contract types and `fetchHealthStatus`
- `src/mocks/handlers/health.ts` — MSW handlers for `GET /health`
- `src/mocks/browser.ts` — browser worker used when `VITE_ENABLE_MSW=true`
- `src/mocks/server.ts` — `setupServer` for Bun tests

First-time setup:

```bash
yarn msw init public
```

Run dev with mocked health (no backend):

```bash
VITE_ENABLE_MSW=true yarn dev
```

See `system-specs/specs/001-baseline-app-poc/quickstart.md` for the full verification path.

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
