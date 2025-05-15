
"use client";

import type { Rocket, Target, PlayerAction } from '@/types';
import React, { useRef, useEffect, useCallback } from 'react';
import { GAME_WIDTH, GAME_HEIGHT } from '@/lib/constants';

interface GameCanvasProps {
  playerRocket: Rocket;
  aiRocket: Rocket;
  targets: Target[];
  onPlayerAction: (action: PlayerAction, active: boolean) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ playerRocket, aiRocket, targets, onPlayerAction }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawRocket = useCallback((ctx: CanvasRenderingContext2D, rocket: Rocket) => {
    ctx.save();
    ctx.translate(rocket.x, rocket.y);
    ctx.rotate(rocket.angle);
    ctx.fillStyle = rocket.color;

    // Draw a triangle for the rocket
    const { size } = rocket;
    ctx.beginPath();
    ctx.moveTo(size / 2, 0); // Nose
    ctx.lineTo(-size / 2, -size / 3); // Wing
    ctx.lineTo(-size / 2, size / 3); // Other wing
    ctx.closePath();
    ctx.fill();

    // Draw thrust flame if active
    if (rocket.thrust > 0) {
      ctx.fillStyle = 'orange';
      ctx.beginPath();
      ctx.moveTo(-size / 2 - 2, 0);
      ctx.lineTo(-size - 2, -size / 5);
      ctx.lineTo(-size - 2, size / 5);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }, []);

  const drawTarget = useCallback((ctx: CanvasRenderingContext2D, target: Target) => {
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
    ctx.fillStyle = target.color;
    ctx.fill();
    ctx.closePath();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'hsl(var(--background))'; // Use background from CSS vars
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw border
    ctx.strokeStyle = 'hsl(var(--border))';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);


    // Draw targets
    targets.forEach(target => drawTarget(ctx, target));

    // Draw rockets
    drawRocket(ctx, playerRocket);
    drawRocket(ctx, aiRocket);

  }, [playerRocket, aiRocket, targets, drawRocket, drawTarget]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          onPlayerAction('thrustOn', true);
          break;
        case 'ArrowLeft':
          onPlayerAction('rotateLeft', true);
          break;
        case 'ArrowRight':
          onPlayerAction('rotateRight', true);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          onPlayerAction('thrustOff', false); // or 'thrustOn', false depending on how you handle continuous thrust
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
          onPlayerAction('stopRotate', false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onPlayerAction]);


  return (
    <canvas
      ref={canvasRef}
      width={GAME_WIDTH}
      height={GAME_HEIGHT}
      className="rounded-lg shadow-2xl border-2 border-primary"
      data-ai-hint="space game"
    />
  );
};

export default GameCanvas;
