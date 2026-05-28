import { afterAll, afterEach, beforeAll, describe, expect, test } from 'bun:test'
import { http, HttpResponse } from 'msw'
import {
  createHealthErrorHandlers,
  createHealthHandlers,
  MOCK_HEALTH_MESSAGE,
} from '../src/mocks/handlers/health'
import { server } from '../src/mocks/server'
import {
  DEFAULT_API_BASE_URL,
  fetchHealthStatus,
  HealthApiError,
} from '../src/services/healthApi'

const testBaseUrl = DEFAULT_API_BASE_URL

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('fetchHealthStatus with MSW', () => {
  test('returns mocked health payload on success', async () => {
    server.use(...createHealthHandlers())

    const result = await fetchHealthStatus(fetch, testBaseUrl)

    expect(result.status).toBe('ok')
    expect(result.timestamp).toBeString()
    expect(result.message).toBe(MOCK_HEALTH_MESSAGE)
  })

  test('throws when health endpoint returns non-OK status', async () => {
    server.use(...createHealthErrorHandlers(503))

    await expect(fetchHealthStatus(fetch, testBaseUrl)).rejects.toThrow(
      'Health API request failed: 503',
    )
  })

  test('throws HealthApiError with status 401', async () => {
    server.use(...createHealthErrorHandlers(401))

    await expect(fetchHealthStatus(fetch, testBaseUrl)).rejects.toMatchObject({
      name: 'HealthApiError',
      status: 401,
    } satisfies Partial<HealthApiError>)
  })

  test('throws HealthApiError with status 403', async () => {
    server.use(...createHealthErrorHandlers(403))

    await expect(fetchHealthStatus(fetch, testBaseUrl)).rejects.toMatchObject({
      name: 'HealthApiError',
      status: 403,
    } satisfies Partial<HealthApiError>)
  })

  test('throws when response body does not match contract', async () => {
    server.use(
      http.get(
        ({ request }) => new URL(request.url).pathname === '/health',
        () => HttpResponse.json({ unexpected: true }),
      ),
    )

    await expect(fetchHealthStatus(fetch, testBaseUrl)).rejects.toThrow(
      'Health API response did not match the expected contract',
    )
  })
})
