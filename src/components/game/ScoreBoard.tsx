
"use client";

import type { FC } from 'react';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClockIcon, UserIcon, BotIcon, RocketIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScoreBoardProps {
  playerScore: number;
  aiScore: number;
  timeLeft: number;
}

const ScoreDisplay: FC<{ score: number; initialScore: number; label: string; icon: React.ReactNode, titleColor?: string }> = ({ score, initialScore, label, icon, titleColor = "text-accent" }) => {
  const [displayScore, setDisplayScore] = useState(initialScore);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (score !== displayScore) {
      setDisplayScore(score);
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 400); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [score, displayScore]);

  return (
    <div className="flex flex-col items-center space-y-1 p-2">
      <div className="flex items-center text-sm text-muted-foreground">
        {icon}
        <span className="ml-2 uppercase tracking-wide font-medium">{label}</span>
      </div>
      <span 
        className={cn(
          "text-4xl font-bold font-mono", 
          titleColor,
          { "animate-score-pulse": animate }
        )}
      >
        {displayScore}
      </span>
    </div>
  );
};


const ScoreBoard: FC<ScoreBoardProps> = ({ playerScore, aiScore, timeLeft }) => {
  return (
    <Card className="w-full shadow-xl bg-card/90 border-border backdrop-blur-sm">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-center text-4xl font-extrabold tracking-wider text-accent uppercase font-sans flex items-center justify-center">
          <RocketIcon className="mr-3 h-8 w-8 text-accent" />
          ROCKET LAUNCH
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 pb-4">
        <div className="flex justify-around items-center">
          <ScoreDisplay score={playerScore} initialScore={0} label="Player 1" icon={<UserIcon className="h-5 w-5 text-primary" />} titleColor="text-primary" />
          
          <div className="flex flex-col items-center space-y-1 p-2">
             <div className="flex items-center text-sm text-muted-foreground">
              <ClockIcon className="mr-2 h-5 w-5 text-muted-foreground" />
              <span className="uppercase tracking-wide font-medium">Time Left</span>
            </div>
            <span className="text-4xl font-bold text-foreground font-mono">{timeLeft}s</span>
          </div>

          <ScoreDisplay score={aiScore} initialScore={0} label="System AI" icon={<BotIcon className="h-5 w-5 text-secondary" />} titleColor="text-secondary" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreBoard;
