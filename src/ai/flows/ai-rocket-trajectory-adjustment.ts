// src/ai/flows/ai-rocket-trajectory-adjustment.ts
'use server';

/**
 * @fileOverview AI-powered rocket trajectory adjustment for a more engaging game experience.
 *
 * - adjustRocketTrajectory - A function that takes the current game state and target information to adjust the AI rocket's trajectory.
 * - AdjustRocketTrajectoryInput - The input type for the adjustRocketTrajectory function, including game state and target data.
 * - AdjustRocketTrajectoryOutput - The return type for the adjustRocketTrajectory function, providing updated AI rocket trajectory.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the AI rocket trajectory adjustment flow
const AdjustRocketTrajectoryInputSchema = z.object({
  playerRocketPositionX: z.number().describe('The x-coordinate of the player rocket.'),
  playerRocketPositionY: z.number().describe('The y-coordinate of the player rocket.'),
  aiRocketPositionX: z.number().describe('The x-coordinate of the AI rocket.'),
  aiRocketPositionY: z.number().describe('The y-coordinate of the AI rocket.'),
  targetPositionX: z.number().describe('The x-coordinate of the target.'),
  targetPositionY: z.number().describe('The y-coordinate of the target.'),
  aiIqLevel: z.number().describe('The IQ level of the AI, influencing its decision-making.'),
});
export type AdjustRocketTrajectoryInput = z.infer<typeof AdjustRocketTrajectoryInputSchema>;

// Define the output schema for the AI rocket trajectory adjustment flow
const AdjustRocketTrajectoryOutputSchema = z.object({
  thrustAdjustment: z
    .number()
    .describe('The suggested thrust adjustment for the AI rocket (e.g., -1 for less thrust, 1 for more thrust).'),
  rotationAdjustment: z
    .number()
    .describe('The suggested rotation adjustment for the AI rocket (e.g., -0.1 for counter-clockwise, 0.1 for clockwise).'),
});
export type AdjustRocketTrajectoryOutput = z.infer<typeof AdjustRocketTrajectoryOutputSchema>;

// Exported function to adjust the rocket trajectory
export async function adjustRocketTrajectory(input: AdjustRocketTrajectoryInput): Promise<AdjustRocketTrajectoryOutput> {
  return adjustRocketTrajectoryFlow(input);
}

// Define the prompt for adjusting rocket trajectory
const adjustRocketTrajectoryPrompt = ai.definePrompt({
  name: 'adjustRocketTrajectoryPrompt',
  input: {schema: AdjustRocketTrajectoryInputSchema},
  output: {schema: AdjustRocketTrajectoryOutputSchema},
  prompt: `You are the flight control system for an AI-controlled rocket in a game. Your goal is to reach the target while competing against a human player.

  Here is the current game state:
  - Player rocket position: ({{playerRocketPositionX}}, {{playerRocketPositionY}})
  - AI rocket position: ({{aiRocketPositionX}}, {{aiRocketPositionY}})
  - Target position: ({{targetPositionX}}, {{targetPositionY}})
  - AI IQ level: {{aiIqLevel}}

  Based on this information, suggest adjustments to the AI rocket's thrust and rotation to intercept the target efficiently, considering the player's position and the AI's intelligence level.

  Output your decision as a JSON object including 'thrustAdjustment' and 'rotationAdjustment' values. Thrust adjustment should be -1, 0, or 1. Rotation adjustment should be a float between -0.2 and 0.2.
  `,
});

// Define the Genkit flow for adjusting rocket trajectory
const adjustRocketTrajectoryFlow = ai.defineFlow(
  {
    name: 'adjustRocketTrajectoryFlow',
    inputSchema: AdjustRocketTrajectoryInputSchema,
    outputSchema: AdjustRocketTrajectoryOutputSchema,
  },
  async input => {
    const {output} = await adjustRocketTrajectoryPrompt(input);
    return output!;
  }
);
