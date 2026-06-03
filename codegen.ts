import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: '../employee-manager-router/supergraph.graphql',
  documents: ['src/graphql/**/*.graphql'],
  generates: {
    './src/generated/graphql/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        enumsAsTypes: true,
        useTypeImports: true,
      },
    },
  },
  ignoreNoDocuments: false,
}

export default config
