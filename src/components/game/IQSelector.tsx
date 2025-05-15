
"use client";

import React, { type FC, useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { IQ_LEVELS } from '@/lib/constants';
import { CpuIcon } from 'lucide-react';

interface IQSelectorProps {
  selectedIQ: number;
  onIQChange: (value: number) => void;
  disabled?: boolean;
}

const IQSelector: FC<IQSelectorProps> = ({ selectedIQ, onIQChange, disabled }) => {
  const handleSelectChange = useCallback((valueString: string) => {
    onIQChange(Number(valueString));
  }, [onIQChange]);

  return (
    <div className="flex flex-col space-y-2 w-full">
      <Label htmlFor="iq-selector" className="text-sm font-medium text-muted-foreground flex items-center">
        <CpuIcon className="mr-2 h-4 w-4 text-primary" />
        AI Adversary Protocol
      </Label>
      <Select
        value={String(selectedIQ)}
        onValueChange={handleSelectChange}
        disabled={disabled}
      >
        <SelectTrigger 
          id="iq-selector" 
          className="w-full bg-input border-border text-foreground focus:ring-ring focus:border-primary hover:border-secondary transition-colors duration-150 ease-in-out"
        >
          <SelectValue placeholder="Select AI Protocol..." />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border text-popover-foreground">
          {IQ_LEVELS.map((level) => (
            <SelectItem 
              key={level.value} 
              value={String(level.value)}
              className="hover:bg-secondary/70 focus:bg-secondary"
            >
              {level.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default IQSelector;

