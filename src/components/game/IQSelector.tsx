
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
import { CpuIcon, BrainCircuitIcon } from 'lucide-react'; // Changed icon

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
        <BrainCircuitIcon className="mr-2 h-5 w-5 text-primary" /> {/* Updated Icon */}
        AI Pilot Program
      </Label>
      <Select
        value={String(selectedIQ)}
        onValueChange={handleSelectChange}
        disabled={disabled}
      >
        <SelectTrigger 
          id="iq-selector" 
          className="w-full bg-input border-border text-foreground focus:ring-2 focus:ring-ring focus:border-primary hover:border-secondary transition-colors duration-150 ease-in-out shadow-md"
        >
          <SelectValue placeholder="Select AI Difficulty..." />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border text-popover-foreground shadow-lg">
          {IQ_LEVELS.map((level) => (
            <SelectItem 
              key={level.value} 
              value={String(level.value)}
              className="hover:bg-primary/20 focus:bg-primary/30 text-popover-foreground data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
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
