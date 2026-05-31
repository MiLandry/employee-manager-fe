import { http, HttpResponse } from 'msw'
import { DEFAULT_API_BASE_URL } from '../../services/healthApi'
import type { Employee } from '../../services/employeesApi'

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    fullName: 'Anna Adams',
    email: 'anna@example.com',
    department: 'Engineering',
    jobTitle: 'Engineer',
    employmentStatus: 'active',
    managerName: 'Bob Manager',
    startDate: '2020-01-01',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    fullName: 'Brian Baker',
    email: 'brian@example.com',
    department: 'Sales',
    jobTitle: 'Rep',
    employmentStatus: 'active',
    managerName: 'Carol Lead',
    startDate: '2021-03-01',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

export const createEmployeeHandlers = (baseUrl = DEFAULT_API_BASE_URL) => [
  http.get(`${baseUrl}/employees/list`, ({ request }) => {
    const url = new URL(request.url)
    const name = url.searchParams.get('name')?.toLowerCase()
    const department = url.searchParams.get('department')

    const employees = MOCK_EMPLOYEES.filter((employee) => {
      const nameMatch = !name || employee.fullName.toLowerCase().includes(name)
      const departmentMatch = !department || employee.department === department
      return nameMatch && departmentMatch
    })

    return HttpResponse.json({ employees })
  }),
]
