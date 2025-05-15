
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const ROCKET_SIZE = 20; // Used as base for rocket drawing
// Updated to use direct HSL values for canvas rendering
export const PLAYER_ROCKET_COLOR = 'hsl(205, 65%, 50%)'; // Was 'hsl(var(--primary))'
export const AI_ROCKET_COLOR = 'hsl(0, 70%, 55%)';      // Was 'hsl(var(--destructive))'

export const TARGET_RADIUS = 15;
// Updated to use direct HSL values for canvas rendering
export const TARGET_COLOR = 'hsl(35, 90%, 60%)';       // Was 'hsl(var(--accent))'
export const MAX_TARGETS = 3;

export const GRAVITY = 0.05;
export const THRUST_POWER = 0.15;
export const ROTATION_SPEED = 0.05; // radians per frame

export const INITIAL_TIME_LIMIT = 90; // Increased from 60

export const AI_DECISION_INTERVAL = 300; // Decreased from 400, makes AI react faster

export const IQ_LEVELS = [
  { label: 'Protocol: Novice (IQ 50)', value: 50 },
  { label: 'Protocol: Adept (IQ 80)', value: 80 },
  { label: 'Protocol: Veteran (IQ 120)', value: 120 },
  { label: 'Protocol: Sentinel (IQ 140)', value: 140 }, // New level
  { label: 'Protocol: Apex (IQ 150)', value: 150 },
];
