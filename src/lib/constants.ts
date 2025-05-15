
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const ROCKET_SIZE = 20; // Used as base for rocket drawing
export const PLAYER_ROCKET_COLOR = 'hsl(var(--primary))'; // Muted Blue from theme
export const AI_ROCKET_COLOR = 'hsl(var(--destructive))'; // Red from theme for AI

export const TARGET_RADIUS = 15;
export const TARGET_COLOR = 'hsl(var(--accent))'; // Desaturated Orange/Gold from theme
export const MAX_TARGETS = 3;

export const GRAVITY = 0.05;
export const THRUST_POWER = 0.15;
export const ROTATION_SPEED = 0.05; // radians per frame

export const INITIAL_TIME_LIMIT = 60; 

export const AI_DECISION_INTERVAL = 400; // milliseconds

export const IQ_LEVELS = [
  { label: 'Protocol: Novice (IQ 50)', value: 50 },
  { label: 'Protocol: Adept (IQ 80)', value: 80 },
  { label: 'Protocol: Veteran (IQ 120)', value: 120 },
  { label: 'Protocol: Apex (IQ 150)', value: 150 },
];

