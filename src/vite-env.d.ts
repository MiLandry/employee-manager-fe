/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_URL?: string
  readonly VITE_MOCK_USER_ID?: string
  readonly VITE_MOCK_ROLES?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
