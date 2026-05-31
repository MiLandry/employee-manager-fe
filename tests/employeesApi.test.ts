import { afterAll, afterEach, beforeAll, describe, expect, test } from 'bun:test'
import { http, HttpResponse } from 'msw'
import { createEmployeeHandlers, MOCK_EMPLOYEES } from '../src/mocks/handlers/employees'
import { server } from '../src/mocks/server'
import {
  listEmployees,
  EmployeesApiError,
} from '../src/services/employeesApi'
import { DEFAULT_API_BASE_URL } from '../src/services/healthApi'

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

describe('employeesApi with MSW', () => {
  test('listEmployees returns mocked employees', async () => {
    server.use(...createEmployeeHandlers())

    const employees = await listEmployees({}, fetch, testBaseUrl, 'admin')
    expect(employees).toHaveLength(MOCK_EMPLOYEES.length)
  })

  test('listEmployees filters by name', async () => {
    server.use(...createEmployeeHandlers())

    const employees = await listEmployees({ name: 'anna' }, fetch, testBaseUrl, 'admin')
    expect(employees).toHaveLength(1)
    expect(employees[0]?.fullName).toBe('Anna Adams')
  })

  test('throws EmployeesApiError with status 403', async () => {
    server.use(
      http.get(`${testBaseUrl}/employees/list`, () =>
        HttpResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 }),
      ),
    )

    await expect(listEmployees({}, fetch, testBaseUrl, 'viewer')).rejects.toMatchObject({
      name: 'HealthApiError',
      status: 403,
    } satisfies Partial<EmployeesApiError>)
  })
})
