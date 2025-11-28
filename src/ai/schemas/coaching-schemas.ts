/**
 * @fileOverview Schemas and types for the coaching AI flow.
 *
 * - CoachingTipsInputSchema - The Zod schema for the input to the coaching flow.
 * - CoachingTipsInput - The TypeScript type for the input to the coaching flow.
 * - CoachingTipsOutputSchema - The Zod schema for the output of the coaching flow.
 * - CoachingTipsOutput - The TypeScript type for the output of the coaching flow.
 */
import { z } from 'zod';

const DistributorStatsSchema = z.object({
    rank: z.string().describe('The current rank of the distributor.'),
    personalVolume: z.number().describe('The personal sales volume of the distributor.'),
    groupVolume: z.number().describe('The total sales volume of the distributor and their downline.'),
    recruits: z.number().describe('The number of new members personally sponsored by the distributor.'),
    placementAllowed: z.boolean().describe('Whether the distributor has an open placement spot in their downline.'),
});

export const CoachingTipsInputSchema = z.object({
  distributor: DistributorStatsSchema,
  nextRankRequirements: z.object({
    rank: z.string().optional(),
    personalVolume: z.number().optional(),
    groupVolume: z.number().optional(),
  }).optional(),
});
export type CoachingTipsInput = z.infer<typeof CoachingTipsInputSchema>;

export const CoachingTipsOutputSchema = z.object({
  tips: z.array(z.object({
      emoji: z.string().describe("An emoji that represents the tip."),
      title: z.string().describe("A short, catchy title for the coaching tip."),
      description: z.string().describe("A concise, actionable recommendation for the distributor.")
  })).describe("An array of 2-3 personalized coaching recommendations.")
});
export type CoachingTipsOutput = z.infer<typeof CoachingTipsOutputSchema>;
