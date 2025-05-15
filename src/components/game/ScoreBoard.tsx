
"use client";

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, Bot } from 'lucide-react';

interface ScoreBoardProps {
  playerScore: number;
  aiScore: number;
  timeLeft: number;
}

const ScoreBoard: FC<ScoreBoardProps> = ({ playerScore, aiScore, timeLeft }) => {
  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-2xl font-bold tracking-wider text-primary">Rocket Rumble</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around items-center text-lg">
          <div className="flex flex-col items-center space-y-1">
            <div className="flex items-center text-foreground">
              <User className="mr-2 h-6 w-6 text-accent" />
              <span>Player</span>
            </div>
            <span className="text-3xl font-bold text-accent">{playerScore}</span>
          </div>

          <div className="flex flex-col items-center space-y-1">
             <div className="flex items-center text-foreground">
              <Clock className="mr-2 h-6 w-6" />
              <span>Time</span>
            </div>
            <span className="text-3xl font-bold">{timeLeft}s</span>
          </div>

          <div className="flex flex-col items-center space-y-1">
            <div className="flex items-center text-foreground">
              <Bot className="mr-2 h-6 w-6 text-accent" />
              <span>AI</span>
            </div>
            <span className="text-3xl font-bold text-accent">{aiScore}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreBoard;
