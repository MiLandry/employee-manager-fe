import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'
import { buildMockAuthHeaders, getEffectiveMockRole } from '../services/mockAuth'

/** Federated gateway (spec 011). Subgraph-only URL is :3000 and cannot serve payroll fields. */
export const DEFAULT_GRAPHQL_URL = 'http://localhost:4000/graphql'

export const getGraphqlUri = (): string =>
  import.meta.env.VITE_GRAPHQL_URL?.trim() || DEFAULT_GRAPHQL_URL

if (import.meta.env.DEV) {
  console.info(`[employee-manager] GraphQL endpoint: ${getGraphqlUri()}`)
}

const authLink = new SetContextLink((prevContext) => ({
  headers: {
    ...prevContext.headers,
    ...buildMockAuthHeaders(getEffectiveMockRole()),
  },
}))

const httpLink = new HttpLink({
  uri: getGraphqlUri(),
})

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
})
