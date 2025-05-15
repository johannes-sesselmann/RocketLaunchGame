
"use client";

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { PlayIcon, PauseIcon, RotateCcwIcon, Loader2Icon } from 'lucide-react';
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
        return { text: 'Launch Mission', icon: <PlayIcon className="h-5 w-5" />, disabled: false };
      case 'running':
        return { text: 'Mission Active...', icon: <Loader2Icon className="h-5 w-5 animate-spin" />, disabled: true };
      case 'over':
        return { text: 'Re-Launch', icon: <RotateCcwIcon className="h-5 w-5" />, disabled: false };
      default:
        return { text: 'Launch', icon: <PlayIcon className="h-5 w-5" />, disabled: false };
    }
  };

  const { text, icon, disabled } = getButtonContent();

  return (
    <Button
      onClick={onStart}
      disabled={disabled}
      className={cn(
        "w-full text-lg py-6 shadow-lg transition-all duration-300 ease-in-out",
        "border-2 border-primary/70 text-primary hover:text-primary-foreground",
        "hover:bg-primary hover:border-primary hover-neon-glow-primary",
        "focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background",
        "disabled:bg-muted disabled:text-muted-foreground disabled:border-muted disabled:opacity-70"
      )}
      variant="outline"
      aria-label={text}
    >
      {icon}
      <span className="ml-3 uppercase tracking-wider font-semibold">{text}</span>
    </Button>
  );
};

export default StartButton;
