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
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { EmployeeDeleteDialog } from '../components/EmployeeDeleteDialog'
import { EmployeeFormDialog } from '../components/EmployeeFormDialog'
import {
  createEmployee,
  deleteEmployee,
  EmployeesApiError,
  listEmployees,
  updateEmployee,
  type Employee,
} from '../services/employeesApi'
import {
  canCreateEmployees,
  canDeleteEmployees,
  canUpdateEmployees,
  MOCK_ROLES,
  type MockRole,
} from '../services/mockAuth'

export function EmployeeListPage() {
  const queryClient = useQueryClient()
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

  const employeesQuery = useQuery({
    queryKey: ['employees', debouncedSearch, departmentFilter, role],
    queryFn: () =>
      listEmployees(
        {
          name: debouncedSearch || undefined,
          department: departmentFilter || undefined,
        },
        fetch,
        undefined,
        role,
      ),
  })

  const refreshEmployees = async () => {
    await queryClient.invalidateQueries({ queryKey: ['employees'] })
    await queryClient.refetchQueries({ queryKey: ['employees'] })
  }

  const openEditDialog = (employee: Employee) => {
    setFormMode('edit')
    setSelectedEmployee(employee)
    setFormOpen(true)
  }

  const openDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setDeleteOpen(true)
  }

  const departments = useMemo(() => {
    const rows = employeesQuery.data ?? []
    return [...new Set(rows.map((row) => row.department))].sort()
  }, [employeesQuery.data])

  const columns = useMemo<GridColDef<Employee>[]>(
    () => [
      { field: 'fullName', headerName: 'Name', flex: 1, minWidth: 160 },
      { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
      { field: 'department', headerName: 'Department', flex: 1, minWidth: 140 },
      { field: 'jobTitle', headerName: 'Title', flex: 1, minWidth: 140 },
      { field: 'employmentStatus', headerName: 'Status', width: 120 },
      { field: 'managerName', headerName: 'Manager', flex: 1, minWidth: 140 },
      { field: 'startDate', headerName: 'Start', width: 120 },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 180,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: ({ row }) => (
          <Stack
            direction="row"
            spacing={1}
            sx={{ height: '100%', alignItems: 'center' }}
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <Button
              size="small"
              disabled={!canUpdateEmployees(role)}
              onClick={(event) => {
                event.stopPropagation()
                openEditDialog(row)
              }}
            >
              Edit
            </Button>
            <Button
              size="small"
              color="error"
              disabled={!canDeleteEmployees(role)}
              onClick={(event) => {
                event.stopPropagation()
                openDeleteDialog(row)
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

  const rows = employeesQuery.data ?? []
  const queryError = employeesQuery.error

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
          {role !== 'admin' && (
            <Typography variant="caption" color="text.secondary">
              Delete requires admin role
            </Typography>
          )}
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

        {queryError instanceof EmployeesApiError && queryError.status === 401 && (
          <Alert severity="warning">Authentication required to view employees.</Alert>
        )}
        {queryError instanceof EmployeesApiError && queryError.status === 403 && (
          <Alert severity="error">
            You are not authorized to view employees with this role.
          </Alert>
        )}
        {queryError && !(queryError instanceof EmployeesApiError) && (
          <Alert severity="error">
            {queryError instanceof Error ? queryError.message : 'Failed to load employees'}
          </Alert>
        )}

        <Box sx={{ height: 520, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={employeesQuery.isLoading}
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            localeText={{
              noRowsLabel:
                !employeesQuery.isLoading && rows.length === 0
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
        onSubmit={async (values) => {
          if (formMode === 'create') {
            await createEmployee(values, fetch, undefined, role)
          } else if (selectedEmployee) {
            await updateEmployee(selectedEmployee.id, values, fetch, undefined, role)
          }
          await refreshEmployees()
        }}
      />

      <EmployeeDeleteDialog
        open={deleteOpen}
        employee={selectedEmployee}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async (employee) => {
          await deleteEmployee(employee.id, fetch, undefined, role)
          await refreshEmployees()
        }}
      />
    </Box>
  )
}
