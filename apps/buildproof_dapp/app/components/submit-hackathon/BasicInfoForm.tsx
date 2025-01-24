import React from 'react';
import { Input, Textarea } from '@0xintuition/buildproof_ui';

interface BasicInfoFormProps {
  partnerName: string;
  hackathonTitle: string;
  description: string;
  onPartnerNameChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export function BasicInfoForm({
  partnerName,
  hackathonTitle,
  description,
  onPartnerNameChange,
  onTitleChange,
  onDescriptionChange
}: BasicInfoFormProps) {
  return (
    <div className="space-y-4">
      <Input
        startAdornment="Partner Name"
        value={partnerName}
        onChange={(e) => onPartnerNameChange(e.target.value)}
        required
      />
      <Input
        startAdornment="Hackathon Title"
        value={hackathonTitle}
        onChange={(e) => onTitleChange(e.target.value)}
        required
      />
      <div className="flex flex-col">
        <label className="mb-1">Description</label>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Enter a brief description of the hackathon"
          required
        />
      </div>
    </div>
  );
} 