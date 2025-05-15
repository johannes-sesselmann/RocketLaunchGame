
"use client";

import type { FC } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { IQ_LEVELS } from '@/lib/constants';

interface IQSelectorProps {
  selectedIQ: number;
  onIQChange: (value: number) => void;
  disabled?: boolean;
}

const IQSelector: FC<IQSelectorProps> = ({ selectedIQ, onIQChange, disabled }) => {
  return (
    <div className="flex flex-col space-y-2 w-full max-w-xs">
      <Label htmlFor="iq-selector" className="text-sm font-medium text-foreground">AI IQ Level</Label>
      <Select
        value={String(selectedIQ)}
        onValueChange={(value) => onIQChange(Number(value))}
        disabled={disabled}
      >
        <SelectTrigger id="iq-selector" className="w-full bg-card text-card-foreground focus:ring-ring">
          <SelectValue placeholder="Select AI IQ" />
        </SelectTrigger>
        <SelectContent>
          {IQ_LEVELS.map((level) => (
            <SelectItem key={level.value} value={String(level.value)}>
              {level.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default IQSelector;
