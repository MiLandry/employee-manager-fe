import type { components } from '../generated/employees.openapi'
import { HealthApiError } from './healthApi'
import { buildMockAuthHeaders, type MockRole } from './mockAuth'

export type Employee = components['schemas']['Employee']
export type EmployeeCreateRequest = components['schemas']['EmployeeCreateRequest']
export type EmployeeUpdateRequest = components['schemas']['EmployeeUpdateRequest']
export type EmploymentStatus = components['schemas']['EmploymentStatus']

export { HealthApiError as EmployeesApiError }

const getEnvApiBaseUrl = (): string =>
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const buildEmployeesListUrl = (
  baseUrl?: string,
  filters?: { name?: string; department?: string },
): string => {
  const normalizedBaseUrl = (baseUrl || getEnvApiBaseUrl()).replace(/\/$/, '')
  const url = new URL(`${normalizedBaseUrl}/employees/list`)
  if (filters?.name) {
    url.searchParams.set('name', filters.name)
  }
  if (filters?.department) {
    url.searchParams.set('department', filters.department)
  }
  return url.toString()
}

const parseApiError = async (response: Response): Promise<never> => {
  const body = await response.text()
  throw new HealthApiError(
    `Employees API request failed: ${response.status} ${response.statusText} - ${body}`,
    response.status,
  )
}

const jsonHeaders = (role: MockRole): Record<string, string> => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  ...buildMockAuthHeaders(role),
})

export const listEmployees = async (
  filters: { name?: string; department?: string } = {},
  fetchFn: typeof fetch = fetch,
  baseUrl?: string,
  role: MockRole = 'admin',
): Promise<Employee[]> => {
  const response = await fetchFn(buildEmployeesListUrl(baseUrl, filters), {
    method: 'GET',
    headers: buildMockAuthHeaders(role),
  })

  if (!response.ok) {
    return parseApiError(response)
  }

  const payload = (await response.json()) as { employees?: Employee[] }
  return payload.employees ?? []
}

export const createEmployee = async (
  input: EmployeeCreateRequest,
  fetchFn: typeof fetch = fetch,
  baseUrl?: string,
  role: MockRole = 'admin',
): Promise<Employee> => {
  const normalizedBaseUrl = (baseUrl || getEnvApiBaseUrl()).replace(/\/$/, '')
  const response = await fetchFn(`${normalizedBaseUrl}/employees/list`, {
    method: 'POST',
    headers: jsonHeaders(role),
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    return parseApiError(response)
  }

  return (await response.json()) as Employee
}

export const updateEmployee = async (
  id: string,
  input: EmployeeUpdateRequest,
  fetchFn: typeof fetch = fetch,
  baseUrl?: string,
  role: MockRole = 'admin',
): Promise<Employee> => {
  const normalizedBaseUrl = (baseUrl || getEnvApiBaseUrl()).replace(/\/$/, '')
  const response = await fetchFn(`${normalizedBaseUrl}/employees/${id}/edit`, {
    method: 'PUT',
    headers: jsonHeaders(role),
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    return parseApiError(response)
  }

  return (await response.json()) as Employee
}

export const deleteEmployee = async (
  id: string,
  fetchFn: typeof fetch = fetch,
  baseUrl?: string,
  role: MockRole = 'admin',
): Promise<void> => {
  const normalizedBaseUrl = (baseUrl || getEnvApiBaseUrl()).replace(/\/$/, '')
  const response = await fetchFn(`${normalizedBaseUrl}/employees/${id}`, {
    method: 'DELETE',
    headers: buildMockAuthHeaders(role),
  })

  if (response.status === 204) {
    return
  }

  if (!response.ok) {
    return parseApiError(response)
  }
}
