
"use client";

import React, { type FC, useCallback } from 'react'; // Added React import for FC and useCallback
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
  }, [onIQChange]); // Dependency on onIQChange prop

  return (
    <div className="flex flex-col space-y-2 w-full">
      <Label htmlFor="iq-selector" className="text-sm font-medium text-foreground/80 flex items-center">
        <CpuIcon className="mr-2 h-4 w-4 text-primary" />
        AI Adversary Protocol
      </Label>
      <Select
        value={String(selectedIQ)}
        onValueChange={handleSelectChange} // Use the memoized handler
        disabled={disabled}
      >
        <SelectTrigger 
          id="iq-selector" 
          className="w-full bg-input border-primary/50 text-foreground focus:ring-primary focus:border-primary hover:border-primary transition-all duration-200 ease-in-out hover:shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
        >
          <SelectValue placeholder="Select AI Protocol..." />
        </SelectTrigger>
        <SelectContent className="bg-popover border-primary/70 text-popover-foreground">
          {IQ_LEVELS.map((level) => (
            <SelectItem 
              key={level.value} 
              value={String(level.value)}
              className="hover:bg-primary/20 focus:bg-primary/30"
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
