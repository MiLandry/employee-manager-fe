import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { useState } from 'react'
import type { Employee } from '../generated/graphql/graphql'

type EmployeeDeleteDialogProps = {
  open: boolean
  employee: Employee | null
  onClose: () => void
  onConfirm: (employee: Employee) => Promise<void>
}

export function EmployeeDeleteDialog({
  open,
  employee,
  onClose,
  onConfirm,
}: EmployeeDeleteDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (!employee) {
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await onConfirm(employee)
      onClose()
    } catch (confirmError) {
      const message =
        confirmError instanceof Error ? confirmError.message : 'Delete failed'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete employee</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Delete {employee?.fullName ?? 'this employee'}? This action cannot be undone.
        </DialogContentText>
        {error && <DialogContentText color="error">{error}</DialogContentText>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button color="error" variant="contained" onClick={() => void handleConfirm()} disabled={submitting}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}
