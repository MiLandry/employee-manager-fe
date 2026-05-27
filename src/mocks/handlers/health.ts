import { http, HttpResponse } from 'msw'
import { API_HEALTH_PATH, type HealthStatus } from '../../services/healthApi'

const isHealthCheckRequest = ({ request }: { request: Request }): boolean => {
  return new URL(request.url).pathname === API_HEALTH_PATH
}

export const MOCK_HEALTH_MESSAGE = 'MSW mock backend connectivity confirmed.'

export const createMockHealthStatus = (
  overrides: Partial<HealthStatus> = {},
): HealthStatus => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  message: MOCK_HEALTH_MESSAGE,
  db: { status: 'up' },
  ...overrides,
})

/**
 * MSW handlers for GET /health at the configured API base URL.
 * Use the same baseUrl as fetchHealthStatus (via VITE_API_BASE_URL) so URLs match.
 */
export const createHealthHandlers = () => {
  return [
    http.get(isHealthCheckRequest, () => HttpResponse.json(createMockHealthStatus())),
  ]
}

/**
 * Returns a failing health response for error-path testing (matches runtime 503 ApiError shape).
 */
export const createHealthErrorHandlers = (httpStatus = 503) => {
  return [
    http.get(isHealthCheckRequest, () =>
      HttpResponse.json(
        {
          error: `Database unavailable: MSW simulated database outage`,
          code: 'DATABASE_UNAVAILABLE',
        },
        { status: httpStatus },
      ),
    ),
  ]
}

/** Default handlers using VITE_API_BASE_URL or http://localhost:3000 */
export const healthHandlers = createHealthHandlers()
