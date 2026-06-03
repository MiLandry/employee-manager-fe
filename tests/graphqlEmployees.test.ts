import { afterAll, afterEach, beforeAll, describe, expect, test } from 'bun:test'
import { EmployeesDocument } from '../src/generated/graphql/graphql'
import { apolloClient } from '../src/lib/apolloClient'
import {
  createEmployeesForbiddenHandlers,
  MOCK_EMPLOYEES,
} from '../src/mocks/handlers/graphql'
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

describe('Employees GraphQL query with MSW', () => {
  test('returns mocked employees', async () => {
    const result = await apolloClient.query({
      query: EmployeesDocument,
      variables: {},
      fetchPolicy: 'no-cache',
    })

    expect(result.data?.employees).toHaveLength(MOCK_EMPLOYEES.length)
  })

  test('filters employees by name', async () => {
    const result = await apolloClient.query({
      query: EmployeesDocument,
      variables: { name: 'anna' },
      fetchPolicy: 'no-cache',
    })

    expect(result.data?.employees).toHaveLength(1)
    expect(result.data?.employees[0]?.fullName).toBe('Anna Adams')
  })

  test('surfaces FORBIDDEN as GraphqlApiError', async () => {
    server.use(...createEmployeesForbiddenHandlers())

    try {
      await apolloClient.query({
        query: EmployeesDocument,
        variables: {},
        fetchPolicy: 'no-cache',
      })
      expect.unreachable('expected GraphQL error')
    } catch (error) {
      const apiError = toGraphqlApiError(error)
      expect(apiError).toBeInstanceOf(GraphqlApiError)
      expect(apiError?.status).toBe(403)
    }
  })
})
