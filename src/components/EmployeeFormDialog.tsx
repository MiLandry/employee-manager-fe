import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import type {
  Employee,
  EmployeeInput,
  EmploymentStatus,
} from '../generated/graphql/graphql'

const EMPLOYMENT_STATUSES = ['active', 'inactive', 'on_leave'] as const satisfies EmploymentStatus[]

export type EmployeeFormValues = EmployeeInput

const toFormValues = (employee?: Employee | null): EmployeeFormValues => ({
  fullName: employee?.fullName ?? '',
  email: employee?.email ?? '',
  department: employee?.department ?? '',
  jobTitle: employee?.jobTitle ?? '',
  employmentStatus: employee?.employmentStatus ?? 'active',
  managerName: employee?.managerName ?? '',
  startDate: employee?.startDate ?? '',
  phone: employee?.phone ?? '',
  location: employee?.location ?? '',
})

type EmployeeFormDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  employee?: Employee | null
  onClose: () => void
  onSubmit: (values: EmployeeFormValues) => Promise<void>
}

export function EmployeeFormDialog({
  open,
  mode,
  employee,
  onClose,
  onSubmit,
}: EmployeeFormDialogProps) {
  const [values, setValues] = useState<EmployeeFormValues>(() => toFormValues(employee))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(values)
      onClose()
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : 'Save failed'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === 'create' ? 'Create employee' : 'Edit employee'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Full name"
            value={values.fullName}
            onChange={(event) =>
              setValues((current) => ({ ...current, fullName: event.target.value }))
            }
            required
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={values.email}
            onChange={(event) =>
              setValues((current) => ({ ...current, email: event.target.value }))
            }
            required
            fullWidth
          />
          <TextField
            label="Department"
            value={values.department}
            onChange={(event) =>
              setValues((current) => ({ ...current, department: event.target.value }))
            }
            required
            fullWidth
          />
          <TextField
            label="Job title"
            value={values.jobTitle}
            onChange={(event) =>
              setValues((current) => ({ ...current, jobTitle: event.target.value }))
            }
            required
            fullWidth
          />
          <TextField
            select
            label="Employment status"
            value={values.employmentStatus}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                employmentStatus: event.target.value as EmploymentStatus,
              }))
            }
            required
            fullWidth
          >
            {EMPLOYMENT_STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Manager name"
            value={values.managerName}
            onChange={(event) =>
              setValues((current) => ({ ...current, managerName: event.target.value }))
            }
            required
            fullWidth
          />
          <TextField
            label="Start date"
            type="date"
            value={values.startDate}
            onChange={(event) =>
              setValues((current) => ({ ...current, startDate: event.target.value }))
            }
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Phone"
            value={values.phone ?? ''}
            onChange={(event) =>
              setValues((current) => ({ ...current, phone: event.target.value }))
            }
            fullWidth
          />
          <TextField
            label="Location"
            value={values.location ?? ''}
            onChange={(event) =>
              setValues((current) => ({ ...current, location: event.target.value }))
            }
            fullWidth
          />
          {error && (
            <TextField
              error
              label="Error"
              value={error}
              slotProps={{ input: { readOnly: true } }}
              fullWidth
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => void handleSubmit()} disabled={submitting}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
