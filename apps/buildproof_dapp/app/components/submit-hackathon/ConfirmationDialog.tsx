import React from 'react';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@0xintuition/buildproof_ui';

interface Triple {
  subject: string | { [key: string]: any };
  predicate: string;
  object: string | number;
  displayValue?: string;
}

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triples: Triple[];
  onConfirm: () => void;
  isLoading?: boolean;
  loadingText?: string;
}

function formatTriplesForDisplay(triples: Triple[]) {
  return triples.map(triple => ({
    subject: triple.subject,
    predicate: triple.predicate,
    object: triple.displayValue || triple.object
  }));
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  triples,
  onConfirm,
  isLoading,
  loadingText
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isLoading ? loadingText || 'Processing...' : 'Confirm Triples Creation'}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-2" />
              <p className="text-sm text-muted-foreground">{loadingText}</p>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(formatTriplesForDisplay(triples), null, 2)}
            </pre>
          )}
        </div>
        <Button 
          onClick={onConfirm} 
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Confirm & Sign'}
        </Button>
      </DialogContent>
    </Dialog>
  );
} 