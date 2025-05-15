
"use client";

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { PlayIcon, RotateCcwIcon, Loader2Icon } from 'lucide-react'; // PauseIcon removed as it was unused
import type { GameStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StartButtonProps {
  gameStatus: GameStatus;
  onStart: () => void;
}

const StartButton: FC<StartButtonProps> = ({ gameStatus, onStart }) => {
  const getButtonContent = () => {
    switch (gameStatus) {
      case 'idle':
        return { text: 'Launch Mission', icon: <PlayIcon className="h-5 w-5" />, disabled: false, variant: "default" as const };
      case 'running':
        return { text: 'Mission Active...', icon: <Loader2Icon className="h-5 w-5 animate-spin" />, disabled: true, variant: "secondary" as const };
      case 'over':
        return { text: 'Re-Launch', icon: <RotateCcwIcon className="h-5 w-5" />, disabled: false, variant: "default" as const };
      default:
        return { text: 'Launch', icon: <PlayIcon className="h-5 w-5" />, disabled: false, variant: "default" as const };
    }
  };

  const { text, icon, disabled, variant } = getButtonContent();

  return (
    <Button
      onClick={onStart}
      disabled={disabled}
      className={cn(
        "w-full text-lg py-6 shadow-md transition-all duration-200 ease-in-out",
        "border focus:ring-2 focus:ring-offset-2 focus:ring-ring focus:ring-offset-background",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        variant === "default" && "bg-primary text-primary-foreground border-primary hover:bg-primary/90",
        variant === "secondary" && "bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/90",
        disabled && "bg-muted text-muted-foreground border-muted"
      )}
      aria-label={text}
    >
      {icon}
      <span className="ml-3 uppercase tracking-wider font-semibold">{text}</span>
    </Button>
  );
};

export default StartButton;

