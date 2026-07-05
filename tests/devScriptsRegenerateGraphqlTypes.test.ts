import { describe, expect, test } from 'bun:test'
import packageJson from '../package.json'

// Reproduces: on a fresh worktree/clone, `src/generated/graphql/` doesn't exist yet
// (codegen has never run). `build` and `test` already regenerate it via a
// `pre<script>` hook / explicit chain before touching source that imports the
// generated types, but `dev` and `dev:mock` did not, so Vite failed to resolve
// `../generated/graphql/graphql` from `src/pages/EmployeeListPage.tsx` on a clean
// checkout. This pins that every entry point which can reach that import has a
// matching pre-generation step, the same convention already used for `build:app`.
describe('entry points that import generated GraphQL types regenerate them first', () => {
  const scripts = packageJson.scripts as Record<string, string>

  test('dev and dev:mock have a predev hook that runs codegen:graphql', () => {
    expect(scripts.predev).toBe('bun run codegen:graphql')
    expect(scripts['predev:mock']).toBe('bun run codegen:graphql')
  })

  test('build:app and test already regenerate (existing convention this fix matches)', () => {
    expect(scripts['prebuild:app']).toBe('bun run codegen:graphql')
    expect(scripts.test).toContain('codegen:graphql')
  })

  test('preview has no gap: it serves an already-built dist/, it does not compile source', () => {
    expect(scripts.preview).toBe('vite preview')
    expect(scripts.prepreview).toBeUndefined()
  })
})
