
"use client";

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { PlayIcon, PauseIcon, RotateCcwIcon } from 'lucide-react';
import type { GameStatus } from '@/types';

interface StartButtonProps {
  gameStatus: GameStatus;
  onStart: () => void;
}

const StartButton: FC<StartButtonProps> = ({ gameStatus, onStart }) => {
  const getButtonContent = () => {
    switch (gameStatus) {
      case 'idle':
        return { text: 'Start Match', icon: <PlayIcon /> };
      case 'running':
        return { text: 'Running...', icon: <PauseIcon />, disabled: true };
      case 'over':
        return { text: 'Play Again', icon: <RotateCcwIcon /> };
      default:
        return { text: 'Start', icon: <PlayIcon /> };
    }
  };

  const { text, icon, disabled } = getButtonContent();

  return (
    <Button
      onClick={onStart}
      disabled={disabled}
      className="w-full max-w-xs text-lg py-6 shadow-lg hover:shadow-primary/50 transition-shadow duration-300"
      aria-label={text}
    >
      {icon}
      <span className="ml-2">{text}</span>
    </Button>
  );
};

export default StartButton;
