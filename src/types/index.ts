
export interface Rocket {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number; // in radians
  thrust: number; // 0 or 1 typically
  color: string;
  size: number;
}

export interface Target {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
}

export type GameStatus = 'idle' | 'running' | 'over';

export interface GameState {
  playerRocket: Rocket;
  aiRocket: Rocket;
  targets: Target[];
  playerScore: number;
  aiScore: number;
  timeLeft: number;
  status: GameStatus;
  selectedIQ: number;
}

export type PlayerAction = 'thrustOn' | 'thrustOff' | 'rotateLeft' | 'rotateRight' | 'stopRotate';
