
"use client";

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { PlayIcon, RotateCcwIcon, Loader2Icon, RocketIcon } from 'lucide-react';
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
        return { text: 'Launch Mission', icon: <RocketIcon className="h-5 w-5" />, disabled: false, variant: "default" as const };
      case 'running':
        return { text: 'Mission Active...', icon: <Loader2Icon className="h-5 w-5 animate-spin" />, disabled: true, variant: "secondary" as const };
      case 'over':
        return { text: 'Re-Launch!', icon: <RotateCcwIcon className="h-5 w-5" />, disabled: false, variant: "default" as const };
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
        "w-full text-lg py-6 shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105",
        "border-2 focus:ring-4 focus:ring-offset-2 focus:ring-ring focus:ring-offset-background",
        "disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none",
        variant === "default" && "bg-accent text-accent-foreground border-accent/80 hover:bg-accent/90",
        variant === "secondary" && "bg-secondary text-secondary-foreground border-secondary/80 hover:bg-secondary/90",
        disabled && variant === "secondary" && "bg-muted text-muted-foreground border-muted hover:bg-muted" // More distinct disabled running state
      )}
      aria-label={text}
    >
      {icon}
      <span className="ml-3 uppercase tracking-wider font-bold">{text}</span>
    </Button>
  );
};

export default StartButton;
