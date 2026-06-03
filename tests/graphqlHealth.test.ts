import { afterAll, afterEach, beforeAll, describe, expect, test } from 'bun:test'
import { HealthDocument } from '../src/generated/graphql/graphql'
import { apolloClient } from '../src/lib/apolloClient'
import { createHealthErrorHandlers, MOCK_HEALTH_MESSAGE } from '../src/mocks/handlers/graphql'
import { server } from '../src/mocks/server'
import { GraphqlApiError, toGraphqlApiError } from '../src/services/graphqlErrors'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('Health GraphQL query with MSW', () => {
  test('returns mocked health payload on success', async () => {
    const result = await apolloClient.query({
      query: HealthDocument,
      fetchPolicy: 'no-cache',
    })

    expect(result.data?.health.status).toBe('ok')
    expect(result.data?.health.timestamp).toBeString()
    expect(result.data?.health.message).toBe(MOCK_HEALTH_MESSAGE)
  })

  test('surfaces DATABASE_UNAVAILABLE as GraphqlApiError', async () => {
    server.use(...createHealthErrorHandlers())

    try {
      await apolloClient.query({
        query: HealthDocument,
        fetchPolicy: 'no-cache',
      })
      expect.unreachable('expected GraphQL error')
    } catch (error) {
      const apiError = toGraphqlApiError(error)
      expect(apiError).toBeInstanceOf(GraphqlApiError)
      expect(apiError?.status).toBe(503)
      expect(apiError?.code).toBe('DATABASE_UNAVAILABLE')
    }
  })
})
