
"use client";

import type { Rocket, Target, PlayerAction } from '@/types';
import React, { useRef, useEffect, useCallback } from 'react';
import { GAME_WIDTH, GAME_HEIGHT } from '@/lib/constants';
import { cn } from '@/lib/utils';

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
    
    // Rocket body
    ctx.fillStyle = rocket.color;
    const { size } = rocket;
    ctx.beginPath();
    ctx.moveTo(size / 1.8, 0); // Nose tip
    ctx.lineTo(-size / 2, -size / 2.8); // Back-left
    ctx.lineTo(-size / 2.8, 0); // Center-back indent
    ctx.lineTo(-size / 2, size / 2.8); // Back-right
    ctx.closePath();
    ctx.fill();
    
    // Subtle outline
    ctx.strokeStyle = "hsla(var(--foreground), 0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw thrust flame if active
    if (rocket.thrust > 0) {
      ctx.fillStyle = `hsl(${Math.random() * 15 + 30}, 100%, 65%)`; // Orange-yellow, slightly varying
      ctx.beginPath();
      const flameLength = size * (0.8 + Math.random() * 0.4);
      ctx.moveTo(-size / 2.8, 0); // Base of flame
      ctx.lineTo(-size / 2.8 - flameLength, -size / 4.5);
      ctx.lineTo(-size / 2.8 - flameLength * 0.8 , 0); // Flicker point
      ctx.lineTo(-size / 2.8 - flameLength, size / 4.5);
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
    
    // Target subtle glow/highlight
    ctx.shadowColor = target.color;
    ctx.shadowBlur = 8;
    ctx.fill(); 
    ctx.shadowColor = 'transparent'; 
    ctx.shadowBlur = 0;

    // Target inner detail
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = "hsla(var(--background), 0.6)"; // Slightly more opaque inner circle
    ctx.fill()

    ctx.closePath();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with background color
    ctx.fillStyle = 'hsl(var(--background))';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
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
        case 'w':
        case 'W':
          e.preventDefault();
          onPlayerAction('thrustOn', true);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          onPlayerAction('rotateLeft', true);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          onPlayerAction('rotateRight', true);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          onPlayerAction('thrustOff', false); 
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
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
      className="rounded-md border border-border" // Simple border
      data-ai-hint="space game battle"
    />
  );
};

export default GameCanvas;

