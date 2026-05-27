import { join } from 'node:path'

/** Repo root (employee-manager-fe). */
export const repoRoot = join(import.meta.dir, '..')

/**
 * Build outputs and tool caches only — safe for `clean`.
 * Does not touch source, lockfile, .env, or public/.
 */
export const cleanPaths = [
  'dist',
  'dist-ssr',
  join('node_modules', '.tmp'),
  join('node_modules', '.vite'),
] as const

/** Removed only by `nuke` (after clean). */
export const nukeOnlyPaths = ['node_modules'] as const
