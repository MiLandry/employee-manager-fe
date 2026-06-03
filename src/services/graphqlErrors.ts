type GraphQLErrorLike = {
  message?: string
  extensions?: {
    code?: string
    http?: { status?: number }
  }
}

type ApolloLikeError = {
  message?: string
  graphQLErrors?: GraphQLErrorLike[]
  errors?: GraphQLErrorLike[]
  networkError?: { statusCode?: number }
}

const firstGraphQLError = (error: ApolloLikeError): GraphQLErrorLike | undefined =>
  error.errors?.[0] ?? error.graphQLErrors?.[0]

export class GraphqlApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'GraphqlApiError'
    this.status = status
    this.code = code
  }
}

export const getGraphqlErrorStatus = (error: unknown): number | undefined => {
  if (!error || typeof error !== 'object') {
    return undefined
  }

  const apolloError = error as ApolloLikeError
  const graphQLError = firstGraphQLError(apolloError)
  const httpStatus = graphQLError?.extensions?.http?.status
  if (typeof httpStatus === 'number') {
    return httpStatus
  }

  if (apolloError.networkError && 'statusCode' in apolloError.networkError) {
    const statusCode = apolloError.networkError.statusCode
    if (typeof statusCode === 'number') {
      return statusCode
    }
  }

  return undefined
}

export const toGraphqlApiError = (error: unknown): GraphqlApiError | null => {
  if (!error || typeof error !== 'object') {
    return null
  }

  const apolloError = error as ApolloLikeError
  const graphQLError = firstGraphQLError(apolloError)
  const status = getGraphqlErrorStatus(error) ?? 500
  const code =
    typeof graphQLError?.extensions?.code === 'string'
      ? graphQLError.extensions.code
      : undefined
  const message = graphQLError?.message ?? apolloError.message ?? 'GraphQL request failed'

  return new GraphqlApiError(message, status, code)
}
