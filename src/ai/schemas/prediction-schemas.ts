/**
 * @fileOverview Schemas for the prediction AI flow.
 */
import { z } from 'zod';

export const PredictionInputSchema = z.object({
  distributorRank: z.string().describe("The distributor's current rank."),
  downline: z.object({
    totalCount: z.number().describe("Total number of distributors in the downline."),
    activeCount: z.number().describe("Number of active distributors."),
    rankCounts: z.object({
      Manager: z.number(),
      Director: z.number(),
      Presidential: z.number(),
    }).describe("Count of distributors at each key rank."),
  }),
  recentGV: z.array(z.object({
    month: z.string(),
    gv: z.number(),
  })).describe("Group Volume for the last few months."),
});
export type PredictionInput = z.infer<typeof PredictionInputSchema>;

export const PredictionOutputSchema = z.object({
  projectedGV: z.number().describe("The forecasted Group Volume for the next 3 months."),
  narrative: z.string().describe("A brief explanation of the growth forecast."),
  confidence: z.number().min(1).max(100).describe("A confidence score for the forecast (1-100)."),
});
export type PredictionOutput = z.infer<typeof PredictionOutputSchema>;
