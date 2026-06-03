import { useMutation, useQuery } from '@apollo/client/react'
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { useEffect, useMemo, useState } from 'react'
import { EmployeeDeleteDialog } from '../components/EmployeeDeleteDialog'
import { EmployeeFormDialog } from '../components/EmployeeFormDialog'
import {
  CreateEmployeeDocument,
  DeleteEmployeeDocument,
  EmployeesDocument,
  UpdateEmployeeDocument,
  type Employee,
  type EmployeeInput,
} from '../generated/graphql/graphql'
import { apolloClient } from '../lib/apolloClient'
import {
  canCreateEmployees,
  canDeleteEmployees,
  canUpdateEmployees,
  canViewCompensation,
  MOCK_ROLES,
  setRuntimeMockRole,
  type MockRole,
} from '../services/mockAuth'
import { GraphqlApiError, toGraphqlApiError } from '../services/graphqlErrors'

export function EmployeeListPage() {
  const [role, setRole] = useState<MockRole>('admin')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setRuntimeMockRole(role)
    void apolloClient.refetchQueries({ include: ['Employees'] })
  }, [role])

  const employeesQuery = useQuery(EmployeesDocument, {
    variables: {
      name: debouncedSearch || undefined,
      department: departmentFilter || undefined,
    },
  })

  const [createEmployeeMutation] = useMutation(CreateEmployeeDocument)
  const [updateEmployeeMutation] = useMutation(UpdateEmployeeDocument)
  const [deleteEmployeeMutation] = useMutation(DeleteEmployeeDocument)

  const refreshEmployees = async () => {
    await employeesQuery.refetch()
  }

  const departments = useMemo(() => {
    const rows = employeesQuery.data?.employees ?? []
    return [...new Set(rows.map((row) => row.department))].sort()
  }, [employeesQuery.data?.employees])

  const columns = useMemo<GridColDef<Employee>[]>(
    () => [
      { field: 'fullName', headerName: 'Name', flex: 1, minWidth: 140 },
      { field: 'email', headerName: 'Email', flex: 1, minWidth: 160 },
      { field: 'department', headerName: 'Department', flex: 1, minWidth: 120 },
      { field: 'jobTitle', headerName: 'Title', flex: 1, minWidth: 120 },
      { field: 'employmentStatus', headerName: 'Status', width: 110 },
      ...(canViewCompensation(role)
        ? [
            {
              field: 'payGrade',
              headerName: 'Pay grade',
              width: 100,
              valueGetter: (_value: unknown, row: Employee) =>
                row.compensationSummary?.payGrade ?? '—',
            },
            {
              field: 'annualBase',
              headerName: 'Annual base',
              width: 120,
              valueGetter: (_value: unknown, row: Employee) => {
                const summary = row.compensationSummary
                if (!summary) {
                  return '—'
                }
                return new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: summary.currency,
                  maximumFractionDigits: 0,
                }).format(summary.annualBase)
              },
            },
          ]
        : []),
      {
        field: 'actions',
        headerName: 'Actions',
        width: 180,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              disabled={!canUpdateEmployees(role)}
              onClick={() => {
                setFormMode('edit')
                setSelectedEmployee(row)
                setFormOpen(true)
              }}
            >
              Edit
            </Button>
            <Button
              size="small"
              color="error"
              disabled={!canDeleteEmployees(role)}
              onClick={() => {
                setSelectedEmployee(row)
                setDeleteOpen(true)
              }}
            >
              Delete
            </Button>
          </Stack>
        ),
      },
    ],
    [role],
  )

  const rows = employeesQuery.data?.employees ?? []
  const queryError = employeesQuery.error
  const apiError = queryError ? toGraphqlApiError(queryError) : null

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="h4" component="h1">
            Employees
          </Typography>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="mock-role-label">Mock role</InputLabel>
            <Select
              labelId="mock-role-label"
              label="Mock role"
              value={role}
              onChange={(event) => setRole(event.target.value as MockRole)}
            >
              {MOCK_ROLES.map((mockRole) => (
                <MenuItem key={mockRole} value={mockRole}>
                  {mockRole}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Search by name"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="department-filter-label">Department</InputLabel>
            <Select
              labelId="department-filter-label"
              label="Department"
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
            >
              <MenuItem value="">All departments</MenuItem>
              {departments.map((department) => (
                <MenuItem key={department} value={department}>
                  {department}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            disabled={!canCreateEmployees(role)}
            onClick={() => {
              setFormMode('create')
              setSelectedEmployee(null)
              setFormOpen(true)
            }}
            sx={{ minWidth: 160 }}
          >
            Create employee
          </Button>
        </Stack>

        {apiError?.status === 401 && (
          <Alert severity="warning">Authentication required to view employees.</Alert>
        )}
        {apiError?.status === 403 && (
          <Alert severity="error">
            You are not authorized to view employees with this role.
          </Alert>
        )}
        {queryError && !apiError && (
          <Alert severity="error">
            {queryError instanceof Error ? queryError.message : 'Failed to load employees'}
          </Alert>
        )}

        <Box sx={{ height: 520, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={employeesQuery.loading}
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            localeText={{
              noRowsLabel:
                !employeesQuery.loading && rows.length === 0
                  ? debouncedSearch || departmentFilter
                    ? 'No matching employees'
                    : 'No employees yet — create the first record'
                  : 'No rows',
            }}
          />
        </Box>
      </Stack>

      <EmployeeFormDialog
        key={`${formMode}-${selectedEmployee?.id ?? 'new'}-${formOpen}`}
        open={formOpen}
        mode={formMode}
        employee={selectedEmployee}
        onClose={() => setFormOpen(false)}
        onSubmit={async (values: EmployeeInput) => {
          if (formMode === 'create') {
            await createEmployeeMutation({ variables: { input: values } })
          } else if (selectedEmployee) {
            await updateEmployeeMutation({
              variables: { id: selectedEmployee.id, input: values },
            })
          }
          await refreshEmployees()
        }}
      />

      <EmployeeDeleteDialog
        open={deleteOpen}
        employee={selectedEmployee}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async (employee) => {
          await deleteEmployeeMutation({ variables: { id: employee.id } })
          await refreshEmployees()
        }}
      />
    </Box>
  )
}

// Re-export for tests that assert error class name
export { GraphqlApiError }
