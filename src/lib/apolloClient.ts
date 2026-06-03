import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'
import { buildMockAuthHeaders, getEffectiveMockRole } from '../services/mockAuth'

export const DEFAULT_GRAPHQL_URL = 'http://localhost:3000/graphql'

export const getGraphqlUri = (): string =>
  import.meta.env.VITE_GRAPHQL_URL?.trim() || DEFAULT_GRAPHQL_URL

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
