
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameCanvas from '@/components/game/GameCanvas';
import ScoreBoard from '@/components/game/ScoreBoard';
import IQSelector from '@/components/game/IQSelector';
import StartButton from '@/components/game/StartButton';
import { Card, CardContent } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';

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
    toast({ title: "Match Started!", description: "Reach the targets to score points!" });
  };

  const handleIQChange = (value: number) => {
    setSelectedIQ(value);
  };

  const updateRocketPhysics = useCallback((rocket: Rocket, playerInput?: Set<PlayerAction>, aiInput?: AdjustRocketTrajectoryOutput): Rocket => {
    let newRocket = { ...rocket };

    // Apply player/AI inputs
    if (playerInput) {
      if (playerInput.has('thrustOn')) newRocket.thrust = 1;
      else newRocket.thrust = 0; // thrustOff is implicit if thrustOn is not present
      
      if (playerInput.has('rotateLeft')) newRocket.angle -= ROTATION_SPEED;
      if (playerInput.has('rotateRight')) newRocket.angle += ROTATION_SPEED;
    } else if (aiInput) {
      newRocket.thrust = aiInput.thrustAdjustment > 0 ? 1 : 0;
      newRocket.angle += aiInput.rotationAdjustment * ROTATION_SPEED * 5; // Make AI rotation more responsive
    } else {
       newRocket.thrust = 0; // Default to no thrust if no input
    }


    // Physics
    newRocket.vy += GRAVITY;

    if (newRocket.thrust > 0) {
      newRocket.vx += Math.cos(newRocket.angle) * THRUST_POWER;
      newRocket.vy += Math.sin(newRocket.angle) * THRUST_POWER;
    }

    newRocket.x += newRocket.vx;
    newRocket.y += newRocket.vy;

    // Boundary checks (simple stop at boundary)
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
    // Update player rocket
    setPlayerRocket(prev => updateRocketPhysics(prev, playerActionsRef.current));
    
    // AI rocket is updated by its timer effect

    // Check collisions
    setTargets(prevTargets => {
      let newTargets = [...prevTargets];
      let playerHit = false;
      let aiHit = false;

      newTargets = newTargets.filter(target => {
        if (checkCollision(playerRocket, target)) {
          setPlayerScore(s => s + 1);
          playerHit = true;
          return false; // Remove target
        }
        if (checkCollision(aiRocket, target)) {
          setAiScore(s => s + 1);
          aiHit = true;
          return false; // Remove target
        }
        return true;
      });

      if (playerHit || aiHit) {
         const numTargetsToAdd = MAX_TARGETS - newTargets.length;
         for(let i=0; i < numTargetsToAdd; i++) {
            newTargets.push(spawnTarget());
         }
      }
      return newTargets;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [playerRocket, aiRocket, updateRocketPhysics, checkCollision, spawnTarget]);


  // AI decision making loop
  useEffect(() => {
    if (gameStatus === 'running') {
      aiTimerRef.current = setInterval(async () => {
        if (targets.length === 0) return; // No target, AI waits
        const currentTarget = targets[0]; // Simplistic: AI always aims for the first target
        
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
          setAiRocket(prev => updateRocketPhysics(prev, undefined, aiDecision));
        } catch (error) {
          console.error("AI trajectory adjustment error:", error);
          // AI might do nothing or a default action on error
          setAiRocket(prev => updateRocketPhysics(prev, undefined, { thrustAdjustment: 0, rotationAdjustment: 0}));
        }
      }, AI_DECISION_INTERVAL);
    } else {
      if (aiTimerRef.current) clearInterval(aiTimerRef.current);
    }
    return () => { if (aiTimerRef.current) clearInterval(aiTimerRef.current); };
  }, [gameStatus, aiRocket, playerRocket, targets, selectedIQ, updateRocketPhysics]);


  // Game timer effect
  useEffect(() => {
    if (gameStatus === 'running') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            setGameStatus('over');
            if (timerRef.current) clearInterval(timerRef.current);
            toast({ 
              title: "Match Over!", 
              description: `Player: ${playerScore}, AI: ${aiScore}. ${playerScore > aiScore ? "You win!" : playerScore < aiScore ? "AI wins!" : "It's a tie!"}`,
              variant: playerScore > aiScore ? "default" : "destructive"
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- playerScore, aiScore needed for toast message
  }, [gameStatus, toast, playerScore, aiScore]);


  // Game loop effect
  useEffect(() => {
    if (gameStatus === 'running') {
      resetGame(); // Initialize targets on game start
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
        playerActionsRef.current.delete('rotateRight');
        playerActionsRef.current.add('rotateLeft');
      }
      if (action === 'rotateRight') {
        playerActionsRef.current.delete('rotateLeft');
        playerActionsRef.current.add('rotateRight');
      }
    } else {
      if (action === 'thrustOff') playerActionsRef.current.delete('thrustOn'); // Assuming 'thrustOff' means stop thrusting
      if (action === 'stopRotate') {
         playerActionsRef.current.delete('rotateLeft');
         playerActionsRef.current.delete('rotateRight');
      }
    }
  }, []);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground font-mono">
      <header className="mb-6 w-full max-w-3xl">
        <ScoreBoard playerScore={playerScore} aiScore={aiScore} timeLeft={timeLeft} />
      </header>

      <main className="mb-6">
        <Card className="shadow-2xl bg-card border-primary border-2">
          <CardContent className="p-0"> {/* Remove padding if canvas handles it */}
            <GameCanvas
              playerRocket={playerRocket}
              aiRocket={aiRocket}
              targets={targets}
              onPlayerAction={handlePlayerAction}
            />
          </CardContent>
        </Card>
      </main>

      <footer className="flex flex-col items-center space-y-4 w-full max-w-xs">
        <IQSelector selectedIQ={selectedIQ} onIQChange={handleIQChange} disabled={gameStatus === 'running'} />
        <StartButton gameStatus={gameStatus} onStart={handleStartGame} />
      </footer>
      <Toaster />
    </div>
  );
}
