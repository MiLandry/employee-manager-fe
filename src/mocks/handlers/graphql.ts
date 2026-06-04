import { graphql, HttpResponse } from 'msw'
import type { Employee, EmploymentStatus } from '../../generated/graphql/graphql'
import { getGraphqlUri } from '../../lib/apolloClient'

export const MOCK_HEALTH_MESSAGE = 'MSW mock backend connectivity confirmed.'

export const MOCK_EMPLOYEES: Employee[] = [
  {
    __typename: 'Employee',
    id: '11111111-1111-1111-1111-111111111111',
    fullName: 'Anna Adams',
    email: 'anna@example.com',
    department: 'Engineering',
    jobTitle: 'Engineer',
    employmentStatus: 'active' as EmploymentStatus,
    managerName: 'Bob Manager',
    startDate: '2020-01-01',
    phone: null,
    location: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    compensationSummary: {
      __typename: 'CompensationSummary',
      payGrade: 'L5',
      currency: 'USD',
      annualBase: 125000,
    },
    lastPayStub: {
      __typename: 'PayStub',
      periodEnd: '2026-05-15',
      netPay: 8234.12,
      currency: 'USD',
    },
  },
  {
    __typename: 'Employee',
    id: '22222222-2222-2222-2222-222222222222',
    fullName: 'Brian Baker',
    email: 'brian@example.com',
    department: 'Sales',
    jobTitle: 'Rep',
    employmentStatus: 'active' as EmploymentStatus,
    managerName: 'Carol Lead',
    startDate: '2021-03-01',
    phone: null,
    location: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    compensationSummary: {
      __typename: 'CompensationSummary',
      payGrade: 'L4',
      currency: 'USD',
      annualBase: 98000,
    },
    lastPayStub: {
      __typename: 'PayStub',
      periodEnd: '2026-05-15',
      netPay: 6120.55,
      currency: 'USD',
    },
  },
]

const graphqlLink = graphql.link(getGraphqlUri())

const filterEmployees = (
  employees: Employee[],
  name?: string | null,
  department?: string | null,
): Employee[] =>
  employees.filter((employee) => {
    const nameMatch =
      !name || employee.fullName.toLowerCase().includes(name.toLowerCase())
    const departmentMatch = !department || employee.department === department
    return nameMatch && departmentMatch
  })

export const graphqlHandlers = [
  graphqlLink.query('Health', () =>
    HttpResponse.json({
      data: {
        health: {
          __typename: 'Health',
          status: 'ok',
          timestamp: new Date().toISOString(),
          message: MOCK_HEALTH_MESSAGE,
          db: { __typename: 'DbProbe', status: 'up', error: null },
        },
      },
    }),
  ),

  graphqlLink.query('Employees', ({ variables }) => {
    const name = variables.name as string | undefined
    const department = variables.department as string | undefined
    return HttpResponse.json({
      data: {
        employees: filterEmployees(MOCK_EMPLOYEES, name, department),
      },
    })
  }),

  graphqlLink.mutation('CreateEmployee', ({ variables }) => {
    const input = variables.input as Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | '__typename'>
    const created: Employee = {
      __typename: 'Employee',
      id: crypto.randomUUID(),
      ...input,
      phone: input.phone ?? null,
      location: input.location ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    MOCK_EMPLOYEES.push(created)
    return HttpResponse.json({ data: { createEmployee: created } })
  }),

  graphqlLink.mutation('UpdateEmployee', ({ variables }) => {
    const id = variables.id as string
    const input = variables.input as Partial<Employee>
    const index = MOCK_EMPLOYEES.findIndex((employee) => employee.id === id)
    if (index === -1) {
      return HttpResponse.json({
        errors: [{ message: 'Not found', extensions: { code: 'NOT_FOUND', http: { status: 404 } } }],
      })
    }
    const updated: Employee = {
      ...MOCK_EMPLOYEES[index]!,
      ...input,
      updatedAt: new Date().toISOString(),
    }
    MOCK_EMPLOYEES[index] = updated
    return HttpResponse.json({ data: { updateEmployee: updated } })
  }),

  graphqlLink.mutation('DeleteEmployee', ({ variables }) => {
    const id = variables.id as string
    const index = MOCK_EMPLOYEES.findIndex((employee) => employee.id === id)
    if (index === -1) {
      return HttpResponse.json({
        errors: [{ message: 'Not found', extensions: { code: 'NOT_FOUND', http: { status: 404 } } }],
      })
    }
    MOCK_EMPLOYEES.splice(index, 1)
    return HttpResponse.json({ data: { deleteEmployee: true } })
  }),
]

export const createHealthErrorHandlers = () => [
  graphqlLink.query('Health', () =>
    HttpResponse.json({
      errors: [
        {
          message: 'Database unavailable: MSW simulated database outage',
          extensions: { code: 'DATABASE_UNAVAILABLE', http: { status: 503 } },
        },
      ],
    }),
  ),
]

export const createEmployeesForbiddenHandlers = () => [
  graphqlLink.query('Employees', () =>
    HttpResponse.json({
      errors: [
        {
          message: 'Forbidden',
          extensions: { code: 'FORBIDDEN', http: { status: 403 } },
        },
      ],
    }),
  ),
]
