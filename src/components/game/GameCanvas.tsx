
"use client";

import type { Rocket, Target, PlayerAction } from '@/types';
import React, { useRef, useEffect, useCallback } from 'react';
import { 
  GAME_WIDTH, GAME_HEIGHT, 
  PLAYER_ROCKET_BODY_COLOR, PLAYER_ROCKET_NOSE_COLOR, PLAYER_ROCKET_WINDOW_COLOR, PLAYER_ROCKET_FLAME_COLOR_1, PLAYER_ROCKET_FLAME_COLOR_2,
  AI_ROCKET_BODY_COLOR, AI_ROCKET_NOSE_COLOR, AI_ROCKET_WINDOW_COLOR, AI_ROCKET_FLAME_COLOR_1, AI_ROCKET_FLAME_COLOR_2,
  CANVAS_BG_COLOR_HSL, CANVAS_TARGET_OUTLINE_HSLA, CANVAS_TARGET_INNER_HSLA
} from '@/lib/constants';
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
    
    const { size } = rocket;
    const bodyWidth = size * 0.6;
    const bodyHeight = size * 1.3; // Main body length
    const noseHeight = size * 0.7;
    const finSize = size * 0.4;

    let bodyColor = PLAYER_ROCKET_BODY_COLOR;
    let noseColor = PLAYER_ROCKET_NOSE_COLOR;
    let windowColor = PLAYER_ROCKET_WINDOW_COLOR;
    let flame1 = PLAYER_ROCKET_FLAME_COLOR_1;
    let flame2 = PLAYER_ROCKET_FLAME_COLOR_2;

    if (rocket.id === 'ai') {
      bodyColor = AI_ROCKET_BODY_COLOR;
      noseColor = AI_ROCKET_NOSE_COLOR;
      windowColor = AI_ROCKET_WINDOW_COLOR;
      flame1 = AI_ROCKET_FLAME_COLOR_1;
      flame2 = AI_ROCKET_FLAME_COLOR_2;
    }

    // Fins (draw behind body)
    ctx.fillStyle = noseColor; // Fins match nose
    ctx.beginPath();
    ctx.moveTo(-bodyWidth / 2, bodyHeight / 2 - finSize*0.2);
    ctx.lineTo(-bodyWidth / 2 - finSize, bodyHeight / 2 + finSize * 0.5);
    ctx.lineTo(-bodyWidth / 2, bodyHeight / 2);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(bodyWidth / 2, bodyHeight / 2 - finSize*0.2);
    ctx.lineTo(bodyWidth / 2 + finSize, bodyHeight / 2 + finSize * 0.5);
    ctx.lineTo(bodyWidth / 2, bodyHeight / 2);
    ctx.closePath();
    ctx.fill();
    
    // Rocket Body (rounded rectangle)
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.roundRect(-bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight, size * 0.1);
    ctx.fill();
    ctx.strokeStyle = "hsl(0, 0%, 60%)"; // Darker grey outline
    ctx.lineWidth = 1;
    ctx.stroke();

    // Nose Cone
    ctx.fillStyle = noseColor;
    ctx.beginPath();
    ctx.moveTo(0, -bodyHeight / 2 - noseHeight); // Tip of the nose
    ctx.lineTo(-bodyWidth / 2, -bodyHeight / 2);
    ctx.lineTo(bodyWidth / 2, -bodyHeight / 2);
    ctx.closePath();
    ctx.fill();

    // Window
    ctx.fillStyle = windowColor;
    ctx.beginPath();
    ctx.arc(0, -bodyHeight / 2 * 0.3, size * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = bodyColor; // Body color as highlight/inner ring
    ctx.lineWidth = 1.5;
    ctx.stroke();


    // Draw thrust flame if active
    if (rocket.thrust > 0) {
      const flameLength = size * (1.2 + Math.random() * 0.5);
      const flameWidth = bodyWidth * 0.8;
      
      ctx.fillStyle = flame1; 
      ctx.beginPath();
      ctx.moveTo(-flameWidth / 2, bodyHeight / 2);
      ctx.lineTo(flameWidth / 2, bodyHeight / 2);
      ctx.lineTo(0, bodyHeight / 2 + flameLength);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = flame2;
      ctx.beginPath();
      ctx.moveTo(-flameWidth / 3, bodyHeight / 2);
      ctx.lineTo(flameWidth / 3, bodyHeight / 2);
      ctx.lineTo(0, bodyHeight / 2 + flameLength * 0.7);
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
    
    ctx.shadowColor = target.color; 
    ctx.shadowBlur = 10;
    ctx.fill(); 
    ctx.shadowColor = 'transparent'; 
    ctx.shadowBlur = 0;

    // Simple craters for planet-like effect
    ctx.fillStyle = CANVAS_TARGET_INNER_HSLA;
    const numCraters = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numCraters; i++) {
        const craterX = target.x + (Math.random() - 0.5) * target.radius * 1.2;
        const craterY = target.y + (Math.random() - 0.5) * target.radius * 1.2;
        const craterRadius = target.radius * (0.15 + Math.random() * 0.2);
        
        // Ensure crater is somewhat within the main circle for a better look
        const distSq = (craterX - target.x)**2 + (craterY - target.y)**2;
        if (distSq < (target.radius - craterRadius)**2) {
            ctx.beginPath();
            ctx.arc(craterX, craterY, craterRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    ctx.strokeStyle = CANVAS_TARGET_OUTLINE_HSLA;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.closePath();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = CANVAS_BG_COLOR_HSL;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    targets.forEach(target => drawTarget(ctx, target));

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
      className="rounded-lg border-2 border-primary shadow-2xl shadow-primary/30" 
      data-ai-hint="space planets rocket"
    />
  );
};

export default GameCanvas;
