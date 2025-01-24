import React from 'react';
import { Input } from '@0xintuition/buildproof_ui';

interface DateSelectionProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export function DateSelection({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}: DateSelectionProps) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return (
    <div className="space-y-4">
      <Input
        type="date"
        startAdornment="Start Date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        required
        min={tomorrow.toISOString().split("T")[0]}
      />
      <Input
        type="date"
        startAdornment="End Date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        required
        min={startDate ? new Date(new Date(startDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] : ''}
        disabled={!startDate || new Date(startDate) < today}
      />
    </div>
  );
} 