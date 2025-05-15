
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const ROCKET_SIZE = 25; // Slightly increased for new design
// Base colors for rockets (multi-color rockets will apply specifics in drawRocket)
export const PLAYER_ROCKET_BODY_COLOR = 'hsl(0, 0%, 90%)'; // White/Light Gray
export const PLAYER_ROCKET_NOSE_COLOR = 'hsl(30, 100%, 55%)'; // Orange
export const PLAYER_ROCKET_WINDOW_COLOR = 'hsl(190, 80%, 70%)'; // Light Blue
export const PLAYER_ROCKET_FLAME_COLOR_1 = 'hsl(45, 100%, 60%)'; // Yellow
export const PLAYER_ROCKET_FLAME_COLOR_2 = 'hsl(30, 100%, 55%)'; // Orange

// AI Rocket colors - can be distinct
export const AI_ROCKET_BODY_COLOR = 'hsl(0, 0%, 40%)'; // Darker Gray
export const AI_ROCKET_NOSE_COLOR = 'hsl(320, 80%, 60%)'; // Magenta
export const AI_ROCKET_WINDOW_COLOR = 'hsl(0, 70%, 55%)'; // Red
export const AI_ROCKET_FLAME_COLOR_1 = 'hsl(320, 80%, 70%)'; // Light Magenta
export const AI_ROCKET_FLAME_COLOR_2 = 'hsl(320, 90%, 50%)'; // Magenta

export const TARGET_RADIUS = 18; // Slightly larger targets
// Updated to use direct HSL values for canvas rendering - representing different planets
export const TARGET_COLOR_1 = 'hsl(320, 80%, 60%)'; // Vibrant Magenta/Pink
export const TARGET_COLOR_2 = 'hsl(200, 90%, 60%)'; // Bright Blue
export const TARGET_COLOR_3 = 'hsl(15, 90%, 55%)';  // Orange/Red
export const TARGET_COLORS = [TARGET_COLOR_1, TARGET_COLOR_2, TARGET_COLOR_3];

export const MAX_TARGETS = 3;

export const GRAVITY = 0.05;
export const THRUST_POWER = 0.15;
export const ROTATION_SPEED = 0.05; // radians per frame

export const INITIAL_TIME_LIMIT = 90; 

export const AI_DECISION_INTERVAL = 300; 

export const IQ_LEVELS = [
  { label: 'Scout Drone (IQ 50)', value: 50 },
  { label: 'Interceptor AI (IQ 80)', value: 80 },
  { label: 'Starship Commander (IQ 120)', value: 120 },
  { label: 'Galactic Sentinel (IQ 140)', value: 140 },
  { label: 'Cosmic Overlord (IQ 150)', value: 150 },
];

// For canvas drawing, direct HSL values from the new theme:
export const CANVAS_BG_COLOR_HSL = 'hsl(270, 40%, 10%)'; // Deep space purple/blue from --background
export const CANVAS_TARGET_OUTLINE_HSLA = 'hsla(260, 10%, 90%, 0.4)'; // --foreground with alpha
export const CANVAS_TARGET_INNER_HSLA = 'hsla(270, 40%, 5%, 0.6)'; // Darker version of bg with alpha
