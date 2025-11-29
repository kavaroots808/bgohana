'use server';
/**
 * @fileOverview An AI agent for generating network marketing coaching recommendations.
 *
 * - getCoachingTips - A function that handles the coaching tip generation process.
 */

import { ai } from '@/ai/genkit';
import { CoachingTipsInputSchema, CoachingTipsOutputSchema, type CoachingTipsInput, type CoachingTipsOutput } from '@/ai/schemas/coaching-schemas';


export async function getCoachingTips(input: CoachingTipsInput): Promise<CoachingTipsOutput> {
  return coachingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'coachingPrompt',
  input: { schema: CoachingTipsInputSchema },
  output: { schema: CoachingTipsOutputSchema },
  prompt: `You are an expert network marketing coach. Your goal is to provide clear, encouraging, and actionable recommendations to help a distributor grow their business.

Analyze the following distributor's performance data. Based on this data, generate 2-3 unique and prioritized coaching tips.

**Distributor Data:**
- Current Rank: {{{distributor.rank}}}
- Personal Volume (PV): {{{distributor.personalVolume}}}
- Group Volume (GV): {{{distributor.groupVolume}}}
- Recent Recruits: {{{distributor.recruits}}}
- Can Recruit: {{{distributor.canRecruit}}}

{{#if nextRankRequirements}}
**Next Rank: {{nextRankRequirements.rank}}**
- Required PV: {{nextRankRequirements.personalVolume}}
- Required GV: {{nextRankRequirements.groupVolume}}
{{else}}
The distributor is at the highest rank.
{{/if}}

**Your Task:**
Generate a list of 2-3 coaching tips. Each tip should include an emoji, a short title, and a clear, concise recommendation.

**Prioritization Guidelines:**
1.  **Rank Advancement:** If the distributor is close to the next rank, prioritize tips that will help them achieve it.
2.  **Weaknesses:** Identify the biggest area for improvement (e.g., low PV, low recruitment) and provide a tip to address it.
3.  **Opportunities:** Highlight immediate opportunities, like recruiting new members if they are able,
4.  **Strengths:** Encourage them to continue good habits.

**Example Scenarios:**
- If PV is low: Recommend focusing on personal sales or customer outreach.
- If GV is close to the next rank but a leg is weak: Suggest supporting and mentoring that leg.
- If recruitment is low: Recommend prospecting or hosting an opportunity meeting.
- If they can recruit: Strongly suggest recruiting to grow their downline and maximize commissions.
- If at the highest rank: Suggest mentoring new leaders and expanding into new markets.

Provide concise, positive, and motivating advice.
`,
});

const coachingFlow = ai.defineFlow(
  {
    name: 'coachingFlow',
    inputSchema: CoachingTipsInputSchema,
    outputSchema: CoachingTipsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
