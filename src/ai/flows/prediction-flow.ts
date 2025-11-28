'use server';
/**
 * @fileOverview An AI agent for generating network marketing growth predictions.
 *
 * - getGrowthPrediction - A function that handles the prediction generation process.
 */
import { ai } from '@/ai/genkit';
import { PredictionInputSchema, PredictionOutputSchema, type PredictionInput, type PredictionOutput } from '@/ai/schemas/prediction-schemas';

export async function getGrowthPrediction(input: PredictionInput): Promise<PredictionOutput> {
    return predictionFlow(input);
}

const prompt = ai.definePrompt({
    name: 'predictionPrompt',
    input: { schema: PredictionInputSchema },
    output: { schema: PredictionOutputSchema },
    prompt: `You are an expert network marketing analyst. Your task is to provide a growth forecast for a distributor based on their team's performance data.

Analyze the following data:
**Distributor's Current Rank:** {{distributorRank}}
**Total Distributors in Downline:** {{downline.totalCount}}
**Active Distributors:** {{downline.activeCount}}
**Rank Distribution:**
- Managers: {{downline.rankCounts.Manager}}
- Directors: {{downline.rankCounts.Director}}
- Presidentials: {{downline.rankCounts.Presidential}}

**Recent Group Volume (GV) Trend:**
{{#each recentGV}}
- {{this.month}}: {{this.gv}}
{{/each}}

**Your Task:**
Based on this data, generate a realistic 3-month growth forecast.

**Output should include:**
1.  **Projected GV:** An estimated Group Volume for the next 3 months.
2.  **Growth Narrative:** A brief explanation of the forecast, highlighting key drivers (like the number of emerging leaders) or potential risks (like a low active distributor ratio).
3.  **Confidence Score:** A score from 1-100 indicating your confidence in this forecast.

**Analysis Guidelines:**
- A high number of active distributors and emerging leaders (Managers, Directors) suggests strong growth potential.
- A flat or declining GV trend may indicate a need for new momentum.
- A low active-to-total distributor ratio could be a risk factor.

Provide a concise, data-driven forecast.
`,
});


const predictionFlow = ai.defineFlow(
    {
        name: 'predictionFlow',
        inputSchema: PredictionInputSchema,
        outputSchema: PredictionOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
