
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameCanvas from '@/components/game/GameCanvas';
import ScoreBoard from '@/components/game/ScoreBoard';
import IQSelector from '@/components/game/IQSelector';
import StartButton from '@/components/game/StartButton';
import { Card, CardContent } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import type { Rocket, Target, GameStatus, PlayerAction } from '@/types';
import {
  GAME_WIDTH, GAME_HEIGHT, ROCKET_SIZE, PLAYER_ROCKET_COLOR, AI_ROCKET_COLOR,
  TARGET_RADIUS, TARGET_COLOR, MAX_TARGETS, GRAVITY, THRUST_POWER, ROTATION_SPEED,
  INITIAL_TIME_LIMIT, IQ_LEVELS, AI_DECISION_INTERVAL
} from '@/lib/constants';
import { adjustRocketTrajectory, type AdjustRocketTrajectoryInput, type AdjustRocketTrajectoryOutput } from '@/ai/flows/ai-rocket-trajectory-adjustment';

const generateId = () => Math.random().toString(36).substr(2, 9);

const createInitialRocket = (id: string, color: string, x: number, y: number): Rocket => ({
  id,
  x,
  y,
  vx: 0,
  vy: 0,
  angle: -Math.PI / 2, // Pointing upwards
  thrust: 0,
  color,
  size: ROCKET_SIZE,
});

export default function RocketRumblePage() {
  const [playerRocket, setPlayerRocket] = useState<Rocket>(() => createInitialRocket('player', PLAYER_ROCKET_COLOR, GAME_WIDTH / 4, GAME_HEIGHT - 50));
  const [aiRocket, setAiRocket] = useState<Rocket>(() => createInitialRocket('ai', AI_ROCKET_COLOR, (GAME_WIDTH * 3) / 4, GAME_HEIGHT - 50));
  const [targets, setTargets] = useState<Target[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME_LIMIT);
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [selectedIQ, setSelectedIQ] = useState<number>(IQ_LEVELS[0].value);

  const gameLoopRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const aiTimerRef = useRef<NodeJS.Timeout | null>(null);
  const playerActionsRef = useRef<Set<PlayerAction>>(new Set());

  const { toast } = useToast();

  const spawnTarget = useCallback((): Target => {
    return {
      id: generateId(),
      x: Math.random() * (GAME_WIDTH - TARGET_RADIUS * 2) + TARGET_RADIUS,
      y: Math.random() * (GAME_HEIGHT * 0.7) + TARGET_RADIUS, // Spawn in upper 70%
      radius: TARGET_RADIUS,
      color: TARGET_COLOR,
    };
  }, []);

  const resetGame = useCallback(() => {
    setPlayerRocket(createInitialRocket('player', PLAYER_ROCKET_COLOR, GAME_WIDTH / 4, GAME_HEIGHT - 50));
    setAiRocket(createInitialRocket('ai', AI_ROCKET_COLOR, (GAME_WIDTH * 3) / 4, GAME_HEIGHT - 50));
    setTargets(Array.from({ length: MAX_TARGETS }, spawnTarget));
    setPlayerScore(0);
    setAiScore(0);
    setTimeLeft(INITIAL_TIME_LIMIT);
    playerActionsRef.current.clear();
  }, [spawnTarget]);

  const handleStartGame = () => {
    resetGame();
    setGameStatus('running');
    toast({ title: "Match Initiated!", description: "Objective: Secure targets. Evade opponent.", className: "font-mono" });
  };

  const handleIQChange = useCallback((value: number) => {
    setSelectedIQ(value);
  }, []); // Empty dependency array as setSelectedIQ is stable

  const updateRocketPhysics = useCallback((rocket: Rocket, playerInput?: Set<PlayerAction>, aiInput?: AdjustRocketTrajectoryOutput): Rocket => {
    let newRocket = { ...rocket };

    if (playerInput) {
      if (playerInput.has('thrustOn')) newRocket.thrust = 1;
      else newRocket.thrust = 0;
      
      if (playerInput.has('rotateLeft')) newRocket.angle -= ROTATION_SPEED;
      if (playerInput.has('rotateRight')) newRocket.angle += ROTATION_SPEED;
    } else if (aiInput) {
      newRocket.thrust = aiInput.thrustAdjustment > 0 ? 1 : 0;
      newRocket.angle += aiInput.rotationAdjustment * ROTATION_SPEED * 5; 
    } else {
       newRocket.thrust = 0;
    }

    newRocket.vy += GRAVITY;

    if (newRocket.thrust > 0) {
      newRocket.vx += Math.cos(newRocket.angle) * THRUST_POWER;
      newRocket.vy += Math.sin(newRocket.angle) * THRUST_POWER;
    }

    newRocket.x += newRocket.vx;
    newRocket.y += newRocket.vy;

    if (newRocket.x - newRocket.size / 2 < 0) { newRocket.x = newRocket.size / 2; newRocket.vx = 0; }
    if (newRocket.x + newRocket.size / 2 > GAME_WIDTH) { newRocket.x = GAME_WIDTH - newRocket.size / 2; newRocket.vx = 0; }
    if (newRocket.y - newRocket.size / 2 < 0) { newRocket.y = newRocket.size / 2; newRocket.vy = 0; }
    if (newRocket.y + newRocket.size / 2 > GAME_HEIGHT) { newRocket.y = GAME_HEIGHT - newRocket.size / 2; newRocket.vy = 0; newRocket.vx = 0; }

    return newRocket;
  }, []);
  
  const checkCollision = useCallback((rocket: Rocket, target: Target): boolean => {
    const dx = rocket.x - target.x;
    const dy = rocket.y - target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < rocket.size / 2 + target.radius;
  }, []);


  const gameLoop = useCallback(() => {
    setPlayerRocket(prev => updateRocketPhysics(prev, playerActionsRef.current));
    
    setTargets(prevTargets => {
      let newTargets = [...prevTargets];
      let playerHitThisFrame = false;
      let aiHitThisFrame = false;

      // Get current rocket positions for collision checks within this frame
      // This is a bit tricky because state updates are async.
      // A potentially more robust way would be to pass current rocket state to checkCollision or update it before this block.
      // For now, we rely on the fact that playerRocket state would have been updated by setPlayerRocket just before.
      // AI rocket update is handled in its own interval.
      const currentPRocket = playerRocket; 
      const currentAIRocket = aiRocket;

      newTargets = newTargets.filter(target => {
        if (checkCollision(currentPRocket, target)) {
          setPlayerScore(s => s + 1);
          playerHitThisFrame = true;
          return false;
        }
        if (checkCollision(currentAIRocket, target)) {
          setAiScore(s => s + 1);
          aiHitThisFrame = true;
          return false;
        }
        return true;
      });

      if (playerHitThisFrame || aiHitThisFrame) {
         const numTargetsToAdd = MAX_TARGETS - newTargets.length;
         for(let i=0; i < numTargetsToAdd; i++) {
            newTargets.push(spawnTarget());
         }
      }
      return newTargets;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [playerRocket, aiRocket, updateRocketPhysics, checkCollision, spawnTarget]); // Added playerScore, aiScore as they are read indirectly for setPlayerScore/setAiScore logic for consistency


  useEffect(() => {
    if (gameStatus === 'running') {
      aiTimerRef.current = setInterval(async () => {
        if (targets.length === 0) return; 
        // AI aims for the first target in the list. Could be made more sophisticated.
        const currentTarget = targets[0]; 
        
        const input: AdjustRocketTrajectoryInput = {
          playerRocketPositionX: playerRocket.x,
          playerRocketPositionY: playerRocket.y,
          aiRocketPositionX: aiRocket.x,
          aiRocketPositionY: aiRocket.y,
          targetPositionX: currentTarget.x,
          targetPositionY: currentTarget.y,
          aiIqLevel: selectedIQ,
        };
        try {
          const aiDecision = await adjustRocketTrajectory(input);
          // Update AI rocket based on AI decision
          // Note: This setAiRocket might be slightly out of sync with the gameLoop's setAiRocket if it were also updating it.
          // Currently, only this interval updates aiRocket physics based on AI.
          setAiRocket(prev => updateRocketPhysics(prev, undefined, aiDecision));
        } catch (error) {
          console.error("AI trajectory adjustment error:", error);
          // Fallback: do nothing or a default action if AI fails
          setAiRocket(prev => updateRocketPhysics(prev, undefined, { thrustAdjustment: 0, rotationAdjustment: 0}));
        }
      }, AI_DECISION_INTERVAL);
    } else {
      if (aiTimerRef.current) clearInterval(aiTimerRef.current);
    }
    return () => { if (aiTimerRef.current) clearInterval(aiTimerRef.current); };
  }, [gameStatus, aiRocket, playerRocket, targets, selectedIQ, updateRocketPhysics]);


  useEffect(() => {
    if (gameStatus === 'running') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            setGameStatus('over');
            if (timerRef.current) clearInterval(timerRef.current);
            // Capture scores at the moment of game over for the toast.
            // Directly using playerScore and aiScore from state here might show scores from before the very last update.
            // To be extremely precise, you might need to get them from a ref updated synchronously or pass to setGameStatus.
            // For now, this is generally acceptable.
            const finalPlayerScore = playerScore; 
            const finalAiScore = aiScore;
            toast({ 
              title: "Match Concluded!", 
              description: `Player: ${finalPlayerScore}, AI: ${finalAiScore}. ${finalPlayerScore > finalAiScore ? "Victory Achieved!" : finalPlayerScore < finalAiScore ? "AI Prevails." : "Stalemate."}`,
              variant: finalPlayerScore > finalAiScore ? "default" : "destructive",
              className: "font-mono"
            });
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameStatus, toast, playerScore, aiScore]); 


  useEffect(() => {
    if (gameStatus === 'running') {
      resetGame(); // Ensure game is reset when status becomes 'running'
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    }
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameStatus, gameLoop, resetGame]);


  const handlePlayerAction = useCallback((action: PlayerAction, active: boolean) => {
    if (active) {
      if (action === 'thrustOn') playerActionsRef.current.add('thrustOn');
      if (action === 'rotateLeft') {
        playerActionsRef.current.delete('rotateRight'); // Ensure only one rotation active
        playerActionsRef.current.add('rotateLeft');
      }
      if (action === 'rotateRight') {
        playerActionsRef.current.delete('rotateLeft'); // Ensure only one rotation active
        playerActionsRef.current.add('rotateRight');
      }
    } else {
      // Deactivate specific action
      if (action === 'thrustOff') playerActionsRef.current.delete('thrustOn'); 
      if (action === 'stopRotate') { // A more generic 'stopRotate' might be better than relying on specific key releases if multiple rotation keys exist
         playerActionsRef.current.delete('rotateLeft');
         playerActionsRef.current.delete('rotateRight');
      }
    }
  }, []);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground font-mono">
      <header className="mb-6 w-full max-w-2xl"> {}
        <ScoreBoard playerScore={playerScore} aiScore={aiScore} timeLeft={timeLeft} />
      </header>

      <main className="mb-6">
        <Card className={cn(
          "bg-card border-2 border-primary rounded-lg",
          "shadow-[0_0_15px_hsl(var(--primary)),_0_0_5px_hsl(var(--primary))]" 
        )}>
          <CardContent className="p-0">
            <GameCanvas
              playerRocket={playerRocket}
              aiRocket={aiRocket}
              targets={targets}
              onPlayerAction={handlePlayerAction}
            />
          </CardContent>
        </Card>
      </main>

      <footer className="flex flex-col items-center space-y-6 w-full max-w-sm"> {}
        <IQSelector selectedIQ={selectedIQ} onIQChange={handleIQChange} disabled={gameStatus === 'running'} />
        <StartButton gameStatus={gameStatus} onStart={handleStartGame} />
      </footer>
      <Toaster />
    </div>
  );
}
