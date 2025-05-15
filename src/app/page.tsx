
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
  GAME_WIDTH, GAME_HEIGHT, ROCKET_SIZE, 
  PLAYER_ROCKET_BODY_COLOR, AI_ROCKET_BODY_COLOR,
  TARGET_RADIUS, TARGET_COLORS, MAX_TARGETS, GRAVITY, THRUST_POWER, ROTATION_SPEED,
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
  color, // Base body color
  size: ROCKET_SIZE,
});

export default function RocketRumblePage() {
  const [playerRocket, setPlayerRocket] = useState<Rocket>(() => createInitialRocket('player', PLAYER_ROCKET_BODY_COLOR, GAME_WIDTH / 4, GAME_HEIGHT - 50));
  const [aiRocket, setAiRocket] = useState<Rocket>(() => createInitialRocket('ai', AI_ROCKET_BODY_COLOR, (GAME_WIDTH * 3) / 4, GAME_HEIGHT - 50));
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

  const playerRocketRef = useRef(playerRocket);
  const aiRocketRef = useRef(aiRocket);
  const targetsRef = useRef(targets);
  const selectedIQRef = useRef(selectedIQ);
  const playerScoreRef = useRef(playerScore);
  const aiScoreRef = useRef(aiScore);


  useEffect(() => { playerRocketRef.current = playerRocket; }, [playerRocket]);
  useEffect(() => { aiRocketRef.current = aiRocket; }, [aiRocket]);
  useEffect(() => { targetsRef.current = targets; }, [targets]);
  useEffect(() => { selectedIQRef.current = selectedIQ; }, [selectedIQ]);
  useEffect(() => { playerScoreRef.current = playerScore; }, [playerScore]);
  useEffect(() => { aiScoreRef.current = aiScore; }, [aiScore]);


  const spawnTarget = useCallback((): Target => {
    return {
      id: generateId(),
      x: Math.random() * (GAME_WIDTH - TARGET_RADIUS * 2) + TARGET_RADIUS,
      y: Math.random() * (GAME_HEIGHT * 0.7) + TARGET_RADIUS, // Spawn in upper 70%
      radius: TARGET_RADIUS,
      color: TARGET_COLORS[Math.floor(Math.random() * TARGET_COLORS.length)], // Random planet color
    };
  }, []);

  const resetGame = useCallback(() => {
    setPlayerRocket(createInitialRocket('player', PLAYER_ROCKET_BODY_COLOR, GAME_WIDTH / 4, GAME_HEIGHT - 50));
    setAiRocket(createInitialRocket('ai', AI_ROCKET_BODY_COLOR, (GAME_WIDTH * 3) / 4, GAME_HEIGHT - 50));
    setTargets(Array.from({ length: MAX_TARGETS }, spawnTarget));
    setPlayerScore(0);
    setAiScore(0);
    setTimeLeft(INITIAL_TIME_LIMIT);
    playerActionsRef.current.clear();
  }, [spawnTarget]);

  const handleStartGame = () => {
    resetGame();
    setGameStatus('running');
    toast({ title: "🚀 Mission Engaged!", description: "Reach the planets. Outmaneuver your rival!", className: "font-sans bg-card text-card-foreground border-primary" });
  };
  
  const handleIQChange = useCallback((value: number) => {
    setSelectedIQ(value);
  }, []); // setSelectedIQ is stable


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

    // Keep rocket within bounds
    if (newRocket.x - newRocket.size / 2 < 0) { newRocket.x = newRocket.size / 2; newRocket.vx = 0; }
    if (newRocket.x + newRocket.size / 2 > GAME_WIDTH) { newRocket.x = GAME_WIDTH - newRocket.size / 2; newRocket.vx = 0; }
    if (newRocket.y - newRocket.size / 2 < 0) { newRocket.y = newRocket.size / 2; newRocket.vy = 0; }
    if (newRocket.y + newRocket.size / 2 > GAME_HEIGHT) { newRocket.y = GAME_HEIGHT - newRocket.size / 2; newRocket.vy = 0; newRocket.vx = 0; }
    
    return newRocket;
  }, []); // Dependencies removed by using refs for changing state, ROTATION_SPEED, GRAVITY, THRUST_POWER are constants.
  
  const checkCollision = useCallback((rocket: Rocket, target: Target): boolean => {
    const dx = rocket.x - target.x;
    const dy = rocket.y - target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < rocket.size / 2 + target.radius;
  }, []);


  const gameLoop = useCallback(() => {
    // Update player rocket based on current actions
    setPlayerRocket(prev => updateRocketPhysics(prev, playerActionsRef.current));
    // AI rocket is updated by its own timer/effect
    
    // Check collisions and update targets
    setTargets(prevTargets => {
      let newTargets = [...prevTargets];
      let playerHitThisFrame = false;
      let aiHitThisFrame = false;

      const currentPRocket = playerRocketRef.current; 
      const currentAIRocket = aiRocketRef.current;

      newTargets = newTargets.filter(target => {
        if (checkCollision(currentPRocket, target)) {
          setPlayerScore(s => s + 1);
          playerHitThisFrame = true;
          return false; // Remove target
        }
        if (checkCollision(currentAIRocket, target)) {
          setAiScore(s => s + 1);
          aiHitThisFrame = true;
          return false; // Remove target
        }
        return true; // Keep target
      });

      // If any target was hit, spawn new ones to maintain MAX_TARGETS
      if (playerHitThisFrame || aiHitThisFrame) {
         const numTargetsToAdd = MAX_TARGETS - newTargets.length;
         for(let i=0; i < numTargetsToAdd; i++) {
            newTargets.push(spawnTarget());
         }
      }
      return newTargets;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [updateRocketPhysics, checkCollision, spawnTarget]); // spawnTarget is stable


  // Effect for AI logic
  useEffect(() => {
    if (gameStatus === 'running') {
      aiTimerRef.current = setInterval(async () => {
        if (targetsRef.current.length === 0) return; 
        
        // AI aims for the closest target (simplistic, can be improved)
        // Or, for now, just the first target as before
        const currentTarget = targetsRef.current[0]; 
        
        const input: AdjustRocketTrajectoryInput = {
          playerRocketPositionX: playerRocketRef.current.x,
          playerRocketPositionY: playerRocketRef.current.y,
          aiRocketPositionX: aiRocketRef.current.x,
          aiRocketPositionY: aiRocketRef.current.y,
          targetPositionX: currentTarget.x,
          targetPositionY: currentTarget.y,
          aiIqLevel: selectedIQRef.current,
        };
        try {
          const aiDecision = await adjustRocketTrajectory(input);
          setAiRocket(prev => updateRocketPhysics(prev, undefined, aiDecision));
        } catch (error) {
          console.error("AI trajectory adjustment error:", error);
          // Fallback: do nothing or minimal action if AI fails
          setAiRocket(prev => updateRocketPhysics(prev, undefined, { thrustAdjustment: 0, rotationAdjustment: 0}));
        }
      }, AI_DECISION_INTERVAL);
    } else {
      if (aiTimerRef.current) clearInterval(aiTimerRef.current);
    }
    return () => { if (aiTimerRef.current) clearInterval(aiTimerRef.current); };
  }, [gameStatus, updateRocketPhysics]); // updateRocketPhysics is stable


  // Effect for game timer
  useEffect(() => {
    if (gameStatus === 'running') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            setGameStatus('over');
            if (timerRef.current) clearInterval(timerRef.current);
            
            const finalPlayerScore = playerScoreRef.current; 
            const finalAiScore = aiScoreRef.current;
            let toastVariant: "default" | "destructive" = "default";
            if (finalPlayerScore < finalAiScore) toastVariant = "destructive";
            else if (finalPlayerScore === finalAiScore) toastVariant = "default";


            toast({ 
              title: "🚀 Mission Complete!", 
              description: `Player 1: ${finalPlayerScore} | System AI: ${finalAiScore}. ${finalPlayerScore > finalAiScore ? "Humans Prevail!" : finalPlayerScore < finalAiScore ? "AI Dominates!" : "Cosmic Draw!"}`,
              variant: toastVariant,
              className: "font-sans bg-card text-card-foreground border-accent"
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
  }, [gameStatus, toast]); // toast is stable due to useToast hook


  // Effect to start/stop game loop
  useEffect(() => {
    if (gameStatus === 'running') {
      resetGame(); // Reset game state before starting loop
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    }
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameStatus, gameLoop, resetGame]); // gameLoop and resetGame are stable


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
      // For keyUp events, 'thrustOff' should correspond to 'thrustOn' being released.
      // 'stopRotate' handles release of either rotation key.
      if (action === 'thrustOff') playerActionsRef.current.delete('thrustOn'); 
      if (action === 'stopRotate') { 
         playerActionsRef.current.delete('rotateLeft');
         playerActionsRef.current.delete('rotateRight');
      }
    }
  }, []); // No dependencies, playerActionsRef is a ref.


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground font-sans">
      <header className="mb-6 w-full max-w-3xl"> {/* Increased max-width for wider scoreboard */}
        <ScoreBoard playerScore={playerScore} aiScore={aiScore} timeLeft={timeLeft} />
      </header>

      <main className="mb-6">
        {/* Removed Card wrapper for direct canvas styling */}
        <GameCanvas
            playerRocket={playerRocket}
            aiRocket={aiRocket}
            targets={targets}
            onPlayerAction={handlePlayerAction}
        />
      </main>

      <footer className="flex flex-col items-center space-y-6 w-full max-w-sm">
        <IQSelector selectedIQ={selectedIQ} onIQChange={handleIQChange} disabled={gameStatus === 'running'} />
        <StartButton gameStatus={gameStatus} onStart={handleStartGame} />
      </footer>
      <Toaster />
    </div>
  );
}
