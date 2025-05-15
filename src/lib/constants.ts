
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const ROCKET_SIZE = 20; // Used as base for triangle height/width
export const PLAYER_ROCKET_COLOR = 'hsl(197 71% 73%)'; // Sky blue
export const AI_ROCKET_COLOR = 'hsl(0 80% 60%)'; // Reddish

export const TARGET_RADIUS = 15;
export const TARGET_COLOR = 'hsl(45 100% 49.8%)'; // Yellow
export const MAX_TARGETS = 3;

export const GRAVITY = 0.05;
export const THRUST_POWER = 0.15;
export const ROTATION_SPEED = 0.05; // radians per frame

export const INITIAL_TIME_LIMIT = 30; // seconds

export const AI_DECISION_INTERVAL = 500; // milliseconds

export const IQ_LEVELS = [
  { label: 'IQ 50 (Easy)', value: 50 },
  { label: 'IQ 80 (Medium)', value: 80 },
  { label: 'IQ 120 (Hard)', value: 120 },
];
