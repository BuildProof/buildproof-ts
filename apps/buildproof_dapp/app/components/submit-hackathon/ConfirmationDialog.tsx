import React from 'react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@0xintuition/buildproof_ui'

import type { Triple } from '@routes/app+/submit-hackathon/utils/types'
import { formatTriplesForDisplay } from '@routes/app+/submit-hackathon/utils/formatters'

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  triples: Triple[]
  onConfirm: () => void
  isLoading?: boolean
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  triples,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Triples Creation</DialogTitle>
          <DialogDescription>
            Please review the following triples that will be created. Click
            "Confirm & Sign" to proceed with the transaction.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-x-auto">
          <pre className="whitespace-pre-wrap break-all">
            {JSON.stringify(formatTriplesForDisplay(triples), null, 2)}
          </pre>
        </div>
        <Button onClick={onConfirm} disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Confirm & Sign'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
